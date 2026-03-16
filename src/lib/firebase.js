import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCiHM-b2f47LQWjGH6HresOx7WEBbRAH54",
  authDomain: "media-guard-ebd29.firebaseapp.com",
  projectId: "media-guard-ebd29",
  storageBucket: "media-guard-ebd29.firebasestorage.app",
  messagingSenderId: "294275766986",
  appId: "1:294275766986:web:f32c067ab1a6df9e6d3233",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
