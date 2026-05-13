/**
 * 📁 firebase-config.js
 * وصف: تهيئة Firebase وإنشاء مثيلات مشتركة للـ Database, Auth, Storage
 */
const firebaseConfig = {
  apiKey: "AIzaSyDjgVxvtPXTn1tpr4IxOK3wOW4r3gzB1VU",
  authDomain: "awj-website-29f16.firebaseapp.com",
  projectId: "awj-website-29f16",
  storageBucket: "awj-website-29f16.firebasestorage.app",
  messagingSenderId: "406747568578",
  appId: "1:406747568578:web:741821d3c60df0011b5e5b"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
