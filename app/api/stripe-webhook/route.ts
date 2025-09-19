import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

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
      
      // Parse client reference: "userId|packageId|priceId"
      const clientRef = session.client_reference_id;
      if (!clientRef) {
        console.error('❌ No client reference found');
        return NextResponse.json({ error: 'No client reference' }, { status: 400 });
      }

      const [userId, packageId, priceId] = clientRef.split('|');
      
      if (!userId || !packageId || !priceId) {
        console.error('❌ Invalid client reference format:', clientRef);
        return NextResponse.json({ error: 'Invalid client reference' }, { status: 400 });
      }

      // Define credit packages (same as frontend)
      const creditPackages: Record<string, { credits: number; bonus?: number }> = {
        'starter': { credits: 100 },
        'popular': { credits: 500, bonus: 50 },
        'pro': { credits: 1000, bonus: 150 },
        'enterprise': { credits: 2500, bonus: 500 }
      };

      const packageInfo = creditPackages[packageId];
      if (!packageInfo) {
        console.error('❌ Invalid package ID:', packageId);
        return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
      }

      const totalCredits = packageInfo.credits + (packageInfo.bonus || 0);

      try {
        // Verify user exists in Firebase
        await adminAuth.getUser(userId);
        
        // Add credits to user's Firestore document
        const userRef = adminDb.collection('users').doc(userId);
        
        await adminDb.runTransaction(async (transaction: any) => {
          const userDoc = await transaction.get(userRef);
          const currentCredits = userDoc.data()?.credits || 0;
          const newCredits = currentCredits + totalCredits;
          
          transaction.set(userRef, {
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
        });

        // Log successful transaction
        await adminDb.collection('transactions').add({
          userId,
          packageId,
          credits: totalCredits,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          stripeSessionId: session.id,
          timestamp: new Date(),
          status: 'completed'
        });

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
