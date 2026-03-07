import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Your Firebase config (copy from web app)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
}

let app: any = null
let auth: any = null
let firestore: any = null
let database: any = null
let storage: any = null

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    firestore = getFirestore(app)
    storage = getStorage(app)
    
    console.log('Firebase initialized successfully')
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

export const getFirebaseAuth = () => auth
export const getFirebaseFirestore = () => firestore
export const getFirebaseStorage = () => storage

// Initialize Firebase when module loads
initializeFirebase()

export default {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage
}
