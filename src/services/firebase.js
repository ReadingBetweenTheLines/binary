import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC--kThymiOj3RqG8tNkYcjUWzzkJ9LK7E",
  authDomain: "binary-clash.firebaseapp.com",
  databaseURL: "https://binary-clash-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "binary-clash",
  storageBucket: "binary-clash.firebasestorage.app",
  messagingSenderId: "185001954977",
  appId: "1:185001954977:web:69c8733fb01e9e64232ae0",
  measurementId: "G-841PD2RBMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database instance
export const db = getDatabase(app);