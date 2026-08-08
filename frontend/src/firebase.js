import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // <-- THIS WAS THE MISSING PIECE!

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5vjkNl7E2K97oIR7GL9A5_-a6ZoxO5F8",
  authDomain: "modernmint-db-8b1a5.firebaseapp.com",
  databaseURL: "https://modernmint-db-8b1a5-default-rtdb.firebaseio.com", // <-- ADD THIS LINE!
  projectId: "modernmint-db-8b1a5",
  storageBucket: "modernmint-db-8b1a5.firebasestorage.app",
  messagingSenderId: "919016173342",
  appId: "1:919016173342:web:187e5d17bcc244c1fc230f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);