import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
  authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
  projectId: "lead-finder-pro-27bf2",
  storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
  messagingSenderId: "197510050244",
  appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
    const uid = localStorage.getItem('user_id');
    if (!uid) return;
    const stats = JSON.parse(localStorage.getItem('driving_stats')) || {total:0, night:0, weekly:0};
    try {
        await setDoc(doc(db, "users", uid), { stats, lastUpdated: new Date().toLocaleTimeString() }, { merge: true });
    } catch (e) { console.error(e); }
}

// Sync whenever a drive ends
window.addEventListener('storage', (e) => {
    if (e.key === 'driving_stats') sync();
});
