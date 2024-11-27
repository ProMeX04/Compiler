import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore'; // Added import

const firebaseConfig = {
  apiKey: "AIzaSyBaWsbEP9KW2GUiVENsYkSW77XyrBinIqA",
  authDomain: "compiler-46fd5.firebaseapp.com",
  databaseURL: "https://compiler-46fd5-default-rtdb.firebaseio.com",
  projectId: "compiler-46fd5",
  storageBucket: "compiler-46fd5.firebasestorage.app",
  messagingSenderId: "283249494920",
  appId: "1:283249494920:web:14e67c01c3298dbde5083d",
  measurementId: "G-W97XFF14NZ",
};

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const db = getFirestore(app); // Added Firestore initialization

export { app, analytics, db }; // Exported db

// Enable Google Auth Provider in your Firebase console:
// 1. Go to Authentication > Sign-in method
// 2. Enable Google sign-in
// 3. Configure OAuth consent screen if needed
// 4. Add authorized domains
