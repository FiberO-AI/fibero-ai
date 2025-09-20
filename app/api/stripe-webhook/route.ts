import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to add credits to user
async function addCreditsToUser(userId: string, packageId: string, session: Stripe.Checkout.Session) {
  // Define credit packages
  const creditPackages: Record<string, { credits: number; bonus?: number }> = {
    'starter': { credits: 100 },
    'popular': { credits: 500, bonus: 50 },
    'pro': { credits: 1000, bonus: 150 },
    'enterprise': { credits: 2500, bonus: 500 }
  };

  const packageInfo = creditPackages[packageId];
  if (!packageInfo) {
    throw new Error(`Invalid package: ${packageId}`);
  }

  const totalCredits = packageInfo.credits + (packageInfo.bonus || 0);

  // Add credits to user's Firestore document
  const userDocRef = adminDb.collection('users').doc(userId);
  const userDoc = await userDocRef.get();
  const userData = userDoc.data();
  const currentCredits = userData?.credits || 0;
  const newCredits = currentCredits + totalCredits;
  
  await userDocRef.set({
    credits: newCredits,
    lastPurchase: {
      packageId,
      credits: totalCredits,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      timestamp: new Date(),
      stripeSessionId: session.id
    }
  }, { merge: true });
  
  console.log(`✅ Added ${totalCredits} credits to user ${userId}. New total: ${newCredits}`);

  // Log transaction
  await adminDb.collection('transactions').add({
    userId,
    packageId,
    credits: totalCredits,
    amount: session.amount_total ? session.amount_total / 100 : 0,
    stripeSessionId: session.id,
    timestamp: new Date(),
    status: 'completed'
  });
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received POST request');
  
  try {
    const body = await request.text();
    console.log('📦 Request body length:', body.length);
    
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    console.log('🔐 Stripe signature present:', !!signature);

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Webhook signature verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('💳 Payment completed:', session.id);
      console.log('👤 Client reference:', session.client_reference_id);
      console.log('💰 Amount paid:', session.amount_total);
      
      // Parse client reference: "userId|packageId|priceId"
      const clientRef = session.client_reference_id;
      if (!clientRef) {
        console.error('❌ No client reference found - using amount to determine package');
        
        // Fallback: determine package by amount paid
        const amountInDollars = session.amount_total ? session.amount_total / 100 : 0;
        let packageId = 'starter';
        if (amountInDollars >= 75) packageId = 'enterprise';
        else if (amountInDollars >= 35) packageId = 'pro';
        else if (amountInDollars >= 20) packageId = 'popular';
        
        console.log(`🔄 Fallback: Using package ${packageId} for amount $${amountInDollars}`);
        
        // Get customer email to find user
        const customerEmail = session.customer_details?.email;
        if (!customerEmail) {
          console.error('❌ No customer email found');
          return NextResponse.json({ error: 'No customer email' }, { status: 400 });
        }
        
        // Find user by email
        try {
          const userRecord = await adminAuth.getUserByEmail(customerEmail);
          const userId = userRecord.uid;
          
          await addCreditsToUser(userId, packageId, session);
          return NextResponse.json({ received: true });
        } catch (userError) {
          console.error('❌ User not found by email:', customerEmail, userError);
          return NextResponse.json({ error: 'User not found' }, { status: 400 });
        }
      }

      const [userId, packageId] = clientRef.split('|');
      
      if (!userId || !packageId) {
        console.error('❌ Invalid client reference format:', clientRef);
        return NextResponse.json({ error: 'Invalid client reference' }, { status: 400 });
      }


      try {
        // Verify user exists in Firebase
        await adminAuth.getUser(userId);
        
        // Add credits using helper function
        await addCreditsToUser(userId, packageId, session);
        
        console.log('🎉 Transaction completed successfully');
        
      } catch (error) {
        console.error('❌ Error adding credits:', error);
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
