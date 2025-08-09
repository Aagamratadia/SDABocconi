// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for SSR, preventing re-initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
// Some networks/ad-blockers/proxies break Firestore's default WebChannel transport
// Use long-polling in the browser to avoid 400 transport errors.
let db: Firestore;
try {
  db = initializeFirestore(app, {
    // Force long polling to avoid WebChannel 400 errors in restricted networks
    experimentalForceLongPolling: true,
    // Alternatively, experimentalAutoDetectLongPolling: true,
  });
} catch {
  // If Firestore is already initialized, fall back to getting the instance
  db = getFirestore(app);
}
const storage = getStorage(app);

export { app, auth, db, storage };