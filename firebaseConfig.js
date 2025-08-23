import {getFirestore} from "@firebase/firestore";
import {initializeApp} from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Firebase config from Firebase Console → Project Settings → General
const firebaseConfig = {
  apiKey: "AIzaSyDJcYVRfJ1Jdl31Y1jTtLxph6g5Ktm-KYU",
  authDomain: "manimate-5f8c8.firebaseapp.com",
  projectId: "manimate-5f8c8",
  storageBucket: "manimate-5f8c8.firebasestorage.app",
  messagingSenderId: "432973415578",
  appId: "1:432973415578:web:b26d78cb9d98248f1a4b23",
  measurementId: "G-PMSVPF6EP2",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
