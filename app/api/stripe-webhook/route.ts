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
  
  try {
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;
    const newCredits = currentCredits + totalCredits;
    
    // Update user document with new credits
    await userDocRef.update({
      credits: newCredits,
      totalCreditsPurchased: (userData?.totalCreditsPurchased || 0) + totalCredits,
      lastPurchase: {
        packageId,
        credits: totalCredits,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        timestamp: new Date(),
        stripeSessionId: session.id
      }
    });
    
    console.log(`✅ Updated user ${userId}: ${currentCredits} → ${newCredits} credits`);
    
  } catch (updateError) {
    console.log('User document may not exist, creating it...');
    
    // If user document doesn't exist, create it
    await userDocRef.set({
      credits: totalCredits,
      totalCreditsPurchased: totalCredits,
      totalCreditsUsed: 0,
      createdAt: new Date(),
      lastPurchase: {
        packageId,
        credits: totalCredits,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        timestamp: new Date(),
        stripeSessionId: session.id
      }
    });
    
    console.log(`✅ Created new user document for ${userId} with ${totalCredits} credits`);
  }

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
    timestamp: new Date().toISOString(),
    endpoint: 'https://fibero-ai.vercel.app/api/stripe-webhook',
    instructions: 'Add this endpoint to your Stripe Dashboard > Webhooks with event: checkout.session.completed'
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
      
      const amountInDollars = session.amount_total ? session.amount_total / 100 : 0;
      
      // Determine package by amount
      let packageId = 'starter';
      if (amountInDollars >= 75) packageId = 'enterprise';
      else if (amountInDollars >= 35) packageId = 'pro';
      else if (amountInDollars >= 20) packageId = 'popular';
      
      try {
        // Simple approach: get all recent mappings and find match
        const mappingsSnapshot = await adminDb.collection('purchase-mappings')
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
        
        if (mappingsSnapshot.empty) {
          console.error('❌ No purchase mappings found');
          return NextResponse.json({ error: 'No mappings found' }, { status: 400 });
        }
        
        // Find matching mapping by amount, package, and timing precision
        let matchedMapping = null;
        let matchedDoc = null;
        
        // Get Stripe session creation time for precise matching
        const stripeSessionCreated = session.created * 1000; // Convert to milliseconds
        
        for (const doc of mappingsSnapshot.docs) {
          const mapping = doc.data();
          const mappingTime = mapping.createdAt.toDate();
          const timeDiff = Date.now() - mappingTime.getTime();
          
          // Check if mapping matches: recent + amount + package + timing precision
          if (timeDiff < 30 * 60 * 1000 && 
              mapping.amount === amountInDollars && 
              mapping.packageId === packageId &&
              Math.abs(mapping.timestamp - stripeSessionCreated) < 120000) { // Within 2 minutes
            matchedMapping = mapping;
            matchedDoc = doc;
            break;
          }
        }
        
        if (!matchedMapping) {
          console.error('❌ No matching mapping found for amount:', amountInDollars, 'package:', packageId);
          return NextResponse.json({ error: 'No matching mapping found' }, { status: 400 });
        }
        
        const fiberoEmail = matchedMapping.fiberoEmail;
        const userId = matchedMapping.userId;
        
        // Add credits directly using userId
        await addCreditsToUser(userId, packageId, session);
        
        // Delete the used mapping
        await matchedDoc.ref.delete();
        
        console.log(`✅ Added ${packageId} credits to ${fiberoEmail} for $${amountInDollars}`);
        
      } catch (error) {
        console.error('❌ Error processing payment:', error);
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
