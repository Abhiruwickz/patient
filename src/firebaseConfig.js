// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1CdjrKz29bLKOFXZkTkc09DMMZYLaXAk",
    authDomain: "medicare-3ec1a.firebaseapp.com",
    projectId: "medicare-3ec1a",
    storageBucket: "medicare-3ec1a.appspot.com",
    messagingSenderId: "748246390802",
    appId: "1:748246390802:web:78cb21fd313db8a27ce0cb",
    measurementId: "G-23PXQ7VM0W"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Firebase Auth
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth
const storage = getStorage(app);

// Export db and auth
export { db, auth, storage };
