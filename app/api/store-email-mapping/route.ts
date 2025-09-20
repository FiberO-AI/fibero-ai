import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { fiberoEmail, userId } = await request.json();
    
    // Store the email mapping in Firestore
    await adminDb.collection('email-mappings').doc(userId).set({
      fiberoEmail,
      userId,
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing email mapping:', error);
    return NextResponse.json({ error: 'Failed to store mapping' }, { status: 500 });
  }
}
