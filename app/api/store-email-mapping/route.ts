import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { fiberoEmail, userId, packageId, amount, timestamp } = await request.json();
    
    // Store the purchase mapping in Firestore with unique ID
    await adminDb.collection('purchase-mappings').add({
      fiberoEmail,
      userId,
      packageId,
      amount,
      timestamp,
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing purchase mapping:', error);
    return NextResponse.json({ error: 'Failed to store mapping' }, { status: 500 });
  }
}
