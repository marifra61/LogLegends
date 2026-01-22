import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
  authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
  projectId: "lead-finder-pro-27bf2",
  storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
  messagingSenderId: "197510050244",
  appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491",
  measurementId: "G-X408V67H4R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.handleCredentialResponse = async function(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userId = payload.sub;

    const statusArea = document.getElementById('sync-status-area');
    if (statusArea) statusArea.style.display = 'block';
    
    document.getElementById('user-info').innerHTML = `
        <img src="${payload.picture}" style="border-radius:50%; width:50px; border: 2px solid #00e5ff;">
        <p style="margin: 5px 0 0 0; font-weight: bold; color: white;">${payload.name}</p>
    `;

    localStorage.setItem('loglegends_user_id', userId);
    await window.syncToCloud();
};

window.syncToCloud = async function() {
    const userId = localStorage.getItem('loglegends_user_id');
    if (!userId || typeof stats === 'undefined') return;

    const timestamp = new Date().toLocaleTimeString();
    try {
        await setDoc(doc(db, "users", userId), { 
            stats: stats,
            lastUpdated: timestamp 
        }, { merge: true });

        const timeSpan = document.getElementById('sync-time');
        if (timeSpan) timeSpan.textContent = timestamp;
    } catch (e) {
        console.error("Sync error:", e);
    }
};
