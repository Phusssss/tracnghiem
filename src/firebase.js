import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuiuR8xtTh9xKHJPoX5cTE6SYiSAt4E1g",
  authDomain: "healt-ebd99.firebaseapp.com",
  projectId: "healt-ebd99",
  storageBucket: "healt-ebd99.appspot.com",
  messagingSenderId: "946826692690",
  appId: "1:946826692690:web:e939552be216a41a09f78b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);