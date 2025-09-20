import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { fiberoEmail, packageId, userId, timestamp } = await request.json();
    
    // Store the mapping in Firestore
    await adminDb.collection('purchase-mappings').add({
      fiberoEmail,
      packageId,
      userId,
      timestamp,
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing purchase mapping:', error);
    return NextResponse.json({ error: 'Failed to store mapping' }, { status: 500 });
  }
}
