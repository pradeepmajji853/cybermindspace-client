import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTmWmEqJUNsLiai8rnc0RwW2_Jzj5A2Vs",
  authDomain: "tools-e1098.firebaseapp.com",
  projectId: "tools-e1098",
  storageBucket: "tools-e1098.firebasestorage.app",
  messagingSenderId: "396955859161",
  appId: "1:396955859161:web:71463fe40453cbf35b66c8",
  measurementId: "G-ZH02205RJD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export default app;
