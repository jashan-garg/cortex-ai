// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: 'cortex-ai-c8d48.firebaseapp.com',
    projectId: 'cortex-ai-c8d48',
    storageBucket: 'cortex-ai-c8d48.firebasestorage.app',
    messagingSenderId: '671557770168',
    appId: '1:671557770168:web:c8e75f663b698f13140d4d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
