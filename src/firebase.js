import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqKawXcfdWAJ62ppfkmYF4fVhSRvk9T4c",
  authDomain: "loctroi-agrichain.firebaseapp.com",
  projectId: "loctroi-agrichain",
  storageBucket: "loctroi-agrichain.firebasestorage.app",
  messagingSenderId: "555991239488",
  appId: "1:555991239488:web:62ee8968bcb939ae4e48a5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
