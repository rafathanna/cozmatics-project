// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC824zNVgKN_i9zdAyjp72crAphQscMzaU",
  authDomain: "cozmatics-77e01.firebaseapp.com",
  projectId: "cozmatics-77e01",
  storageBucket: "cozmatics-77e01.firebasestorage.app",
  messagingSenderId: "1026309465362",
  appId: "1:1026309465362:web:7bd1b18a92243dfb307fcb",
  measurementId: "G-R0CYTDJPB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
