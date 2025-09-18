import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's 2FA status from Firebase
    const userDocRef = doc(db, 'users', userId);
    let userDoc, userData;
    
    try {
      userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return NextResponse.json({
          success: true,
          twoFactorEnabled: false,
          twoFactorSetupComplete: false
        });
      }

      userData = userDoc.data();
    } catch (error) {
      console.error('Firebase get document error:', error);
      return NextResponse.json({
        success: true,
        twoFactorEnabled: false,
        twoFactorSetupComplete: false
      });
    }
    
    return NextResponse.json({
      success: true,
      twoFactorEnabled: userData.twoFactorEnabled || false,
      twoFactorSetupComplete: userData.twoFactorSetupComplete || false
    });

  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
}
