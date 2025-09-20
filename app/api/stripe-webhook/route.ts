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
        // Find exact matching purchase by amount and package (within last 30 minutes)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        const mappingsSnapshot = await adminDb.collection('purchase-mappings')
          .where('timestamp', '>', thirtyMinutesAgo)
          .where('amount', '==', amountInDollars)
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get();
        
        if (mappingsSnapshot.empty) {
          console.error('❌ No matching purchase found');
          return NextResponse.json({ error: 'No matching purchase found' }, { status: 400 });
        }
        
        // Find the exact match by package
        let matchedMapping = null;
        for (const doc of mappingsSnapshot.docs) {
          const mapping = doc.data();
          if (mapping.packageId === packageId) {
            matchedMapping = mapping;
            // Delete the used mapping to prevent duplicate credits
            await doc.ref.delete();
            break;
          }
        }
        
        if (!matchedMapping) {
          console.error('❌ No exact package match found');
          return NextResponse.json({ error: 'No exact package match' }, { status: 400 });
        }
        
        const fiberoEmail = matchedMapping.fiberoEmail;
        const userId = matchedMapping.userId;
        
        // Add credits directly using userId
        await addCreditsToUser(userId, packageId, session);
        
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
