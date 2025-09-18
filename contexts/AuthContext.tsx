'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: number;
  creditsLoading: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean; userId?: string }>;
  verifyTwoFactor: (userId: string, code: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  updateProfile: (data: { displayName?: string }) => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Initialize user credits document if it doesn't exist
        await initializeUserCredits(user.uid);
        // Set up real-time listener for credits
        setupCreditsListener(user.uid);
      } else {
        setCredits(0);
        setCreditsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const initializeUserCredits = async (userId: string) => {
    try {
      console.log('Initializing credits for user:', userId);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('Creating new user document with 10 free credits');
        // Create new user document with 10 free credits
        await setDoc(userDocRef, {
          credits: 10,
          createdAt: new Date(),
          totalCreditsUsed: 0,
          totalCreditsPurchased: 0
        });
        console.log('User document created successfully');
      } else {
        console.log('User document already exists with credits:', userDoc.data().credits);
      }
    } catch (error) {
      console.error('Error initializing user credits:', error);
      // If Firestore fails, use localStorage as fallback
      const savedCredits = localStorage.getItem(`credits_${userId}`);
      if (savedCredits) {
        setCredits(parseInt(savedCredits));
      } else {
        // Give new users 10 free credits
        setCredits(10);
        localStorage.setItem(`credits_${userId}`, '10');
      }
      setCreditsLoading(false);
    }
  };

  const setupCreditsListener = (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('Credits updated from Firestore:', data.credits);
        setCredits(data.credits || 0);
        setCreditsLoading(false);
      } else {
        console.log('User document does not exist in snapshot, initializing...');
        // If document doesn't exist, initialize it
        initializeUserCredits(userId);
      }
    }, (error) => {
      console.error('Error listening to credits:', error);
      // Fallback to localStorage
      const savedCredits = localStorage.getItem(`credits_${userId}`);
      if (savedCredits) {
        setCredits(parseInt(savedCredits));
      } else {
        setCredits(10);
        localStorage.setItem(`credits_${userId}`, '10');
      }
      setCreditsLoading(false);
    });

    return unsubscribe;
  };

  const login = async (email: string, password: string): Promise<{ requiresTwoFactor: boolean; userId?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has 2FA enabled
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().twoFactorEnabled) {
        // Store credentials temporarily for 2FA completion
        sessionStorage.setItem('pendingLogin', JSON.stringify({ email, password }));
        
        // Sign out immediately since we need 2FA verification
        await signOut(auth);
        return { requiresTwoFactor: true, userId: user.uid };
      }
      
      // No 2FA required, login successful
      return { requiresTwoFactor: false };
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const verifyTwoFactor = async (userId: string, code: string) => {
    try {
      // Verify the 2FA code with our API
      const response = await fetch('/api/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: code
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Get the stored login credentials from sessionStorage
      const storedCredentials = sessionStorage.getItem('pendingLogin');
      if (!storedCredentials) {
        throw new Error('Login session expired. Please try again.');
      }

      const { email, password } = JSON.parse(storedCredentials);
      
      // Now complete the login process
      await signInWithEmailAndPassword(auth, email, password);
      
      // Clear the stored credentials
      sessionStorage.removeItem('pendingLogin');
      
    } catch (error: any) {
      // Clear stored credentials on any error
      sessionStorage.removeItem('pendingLogin');
      throw new Error(error.message || 'Failed to verify 2FA code');
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile - this is critical
      await firebaseUpdateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Send email verification - make this non-blocking
      try {
        // Use production URL if available, fallback to current origin
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const actionCodeSettings = {
          url: `${baseUrl}/auth/action`,
          handleCodeInApp: false
        };
        await sendEmailVerification(user, actionCodeSettings);
        console.log('Email verification sent successfully to:', actionCodeSettings.url);
      } catch (emailError) {
        console.warn('Failed to send email verification:', emailError);
        // Don't throw error here - account creation was successful
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to log out');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const sendEmailVerificationToUser = async () => {
    try {
      if (auth.currentUser) {
        // Use production URL if available, fallback to current origin
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const actionCodeSettings = {
          url: `${baseUrl}/auth/action`,
          handleCodeInApp: false
        };
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        return auth.currentUser.emailVerified;
      }
      return false;
    } catch (error: any) {
      throw new Error('Failed to check verification status');
    }
  };

  const updateUserProfile = async (data: { displayName?: string }) => {
    try {
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, data);
        // Trigger a re-render by updating the user state
        await reload(auth.currentUser);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error: any) {
      throw new Error('Failed to update profile');
    }
  };

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Fallback to localStorage if Firestore fails
        const savedCredits = localStorage.getItem(`credits_${user.uid}`);
        const currentCredits = savedCredits ? parseInt(savedCredits) : 0;
        
        if (currentCredits < amount) {
          return false;
        }
        
        const newCredits = currentCredits - amount;
        localStorage.setItem(`credits_${user.uid}`, newCredits.toString());
        setCredits(newCredits);
        return true;
      }

      const currentCredits = userDoc.data().credits || 0;
      
      if (currentCredits < amount) {
        return false; // Insufficient credits
      }

      await updateDoc(userDocRef, {
        credits: currentCredits - amount,
        totalCreditsUsed: (userDoc.data().totalCreditsUsed || 0) + amount,
        lastUsed: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      // Fallback to localStorage
      const savedCredits = localStorage.getItem(`credits_${user.uid}`);
      const currentCredits = savedCredits ? parseInt(savedCredits) : 0;
      
      if (currentCredits < amount) {
        return false;
      }
      
      const newCredits = currentCredits - amount;
      localStorage.setItem(`credits_${user.uid}`, newCredits.toString());
      setCredits(newCredits);
      return true;
    }
  };

  const addCredits = async (amount: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const currentCredits = userDoc.data().credits || 0;
      
      await updateDoc(userDocRef, {
        credits: currentCredits + amount,
        totalCreditsPurchased: (userDoc.data().totalCreditsPurchased || 0) + amount,
        lastPurchase: new Date()
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      throw new Error('Failed to add credits');
    }
  };

  const refreshCredits = async () => {
    if (!user) {
      console.log('RefreshCredits: No user found');
      return;
    }
    
    try {
      console.log('RefreshCredits: Fetching credits for user:', user.uid);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const newCredits = userDoc.data().credits || 0;
        console.log('RefreshCredits: Found credits in Firestore:', newCredits);
        setCredits(newCredits);
      } else {
        console.log('RefreshCredits: User document does not exist');
      }
    } catch (error) {
      console.error('RefreshCredits: Error refreshing credits:', error);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please wait before trying again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    credits,
    creditsLoading,
    login,
    verifyTwoFactor,
    signup,
    logout,
    loginWithGoogle,
    resetPassword,
    sendEmailVerification: sendEmailVerificationToUser,
    checkEmailVerified,
    updateProfile: updateUserProfile,
    deductCredits,
    addCredits,
    refreshCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
