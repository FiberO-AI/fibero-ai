import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFbJ3PEuj1Ox3SFQnDPVhTnO5ThYP9png",
  authDomain: "fibero-ai.firebaseapp.com",
  projectId: "fibero-ai",
  storageBucket: "fibero-ai.firebasestorage.app",
  messagingSenderId: "168872341070",
  appId: "1:168872341070:web:041e06d59de7ec7cacdd1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
