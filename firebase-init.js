import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

// 初始化 Firebase App
const app = initializeApp(firebaseConfig);

// Firestore & Auth 實例
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 登入（Google OAuth）
async function login(){
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert("登入失敗: " + err.message);
  }
}

// 登出
async function logout(){
  try {
    await signOut(auth);
  } catch (err) {
    alert("登出失敗: " + err.message);
  }
}

export { db, auth, login, logout };
