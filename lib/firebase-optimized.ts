import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Singleton pattern to prevent multiple initializations
let adminApp: any = null;
let adminAuthInstance: any = null;
let adminDbInstance: any = null;

// Initialize Firebase Admin SDK with singleton pattern
function initializeFirebaseAdmin() {
  if (adminApp) {
    return { adminAuth: adminAuthInstance, adminDb: adminDbInstance };
  }

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }

  adminAuthInstance = getAuth(adminApp);
  adminDbInstance = getFirestore(adminApp);

  return { adminAuth: adminAuthInstance, adminDb: adminDbInstance };
}

// Export singleton instances
const { adminAuth, adminDb } = initializeFirebaseAdmin();

export { adminAuth, adminDb };
