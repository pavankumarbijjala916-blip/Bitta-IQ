import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
// IMPORTANT: Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Object.values(firebaseConfig).some(value => value && value !== "" && value !== "demo-project");

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let messaging: any = null;
let analytics: any = null;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize messaging only if not in a worker context
    if (typeof window !== "undefined") {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.warn("Firebase Messaging not available:", error);
      }
    }

    // Initialize Analytics
    if (typeof window !== "undefined") {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.warn("Firebase Analytics not available:", error);
      }
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    console.warn("Firebase is not properly configured. Please add Firebase environment variables to .env file.");
  }
} else {
  console.warn("Firebase environment variables not found. Using Supabase only.");
}

export { app, auth, db, storage, messaging, analytics };
export default app;
