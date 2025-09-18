import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration - using the same config as the main app
const firebaseConfig = {
  apiKey: "AIzaSyDFbJ3PEuj1Ox3SFQnDPVhTnO5ThYP9png",
  authDomain: "fibero-ai.firebaseapp.com",
  projectId: "fibero-ai",
  storageBucket: "fibero-ai.firebasestorage.app",
  messagingSenderId: "168872341070",
  appId: "1:168872341070:web:041e06d59de7ec7cacdd1f"
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

    // Verify the token before disabling
    const isValid = authenticator.verify({
      token: token.toString(),
      secret: secret
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    try {
      await updateDoc(userDocRef, {
        twoFactorEnabled: false,
        twoFactorDisabledAt: new Date()
      });
    } catch (error) {
      console.error('Firebase update document error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
