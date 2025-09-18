import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

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
    const { userId, token, enableTwoFactor = false } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: 'User ID and token are required' },
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
          { success: false, error: 'User not found or 2FA not set up' },
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

    if (!secret) {
      return NextResponse.json(
        { success: false, error: '2FA not set up for this user' },
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
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // If this is enabling 2FA for the first time, update the user document
    if (enableTwoFactor) {
      try {
        await updateDoc(userDocRef, {
          twoFactorEnabled: true,
          twoFactorSetupComplete: true,
          twoFactorEnabledAt: new Date()
        });
      } catch (error) {
        console.error('Firebase update document error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to enable 2FA' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Token verified successfully',
      twoFactorEnabled: enableTwoFactor ? true : userData.twoFactorEnabled
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify 2FA token' },
      { status: 500 }
    );
  }
}
