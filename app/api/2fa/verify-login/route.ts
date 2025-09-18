import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: 'User ID and verification token are required' },
        { status: 400 }
      );
    }

    // Get user's TOTP secret from Firebase
    const userDocRef = doc(db, 'users', userId);
    let userDoc, userData, secret;
    
    try {
      userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      userData = userDoc.data();
      secret = userData?.totpSecret;
    } catch (error) {
      console.error('Firebase get document error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve user data' },
        { status: 500 }
      );
    }

    if (!secret || !userData.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is not enabled for this user' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = authenticator.verify({
      token: token.toString(),
      secret: secret
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}
