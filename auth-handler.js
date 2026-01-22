import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

function renderUI() {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;

    const area = document.getElementById('sync-status-area');
    const btn = document.querySelector(".g_id_signin");
    const name = localStorage.getItem('loglegends_user_name');
    const pic = localStorage.getItem('loglegends_user_pic');

    if (area) area.style.setProperty('display', 'block', 'important');
    if (btn) btn.style.display = "none";
    
    const info = document.getElementById('user-info');
    if (info) {
        info.innerHTML = `
            <img src="${pic}" style="border-radius:50%; width:45px; border:2px solid #00e5ff;">
            <p style="color:white; margin:5px 0; font-weight:bold;">${name}</p>
        `;
    }
}

window.handleCredentialResponse = async (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);
    
    renderUI();
    await window.syncToCloud();
};

window.syncToCloud = async () => {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;
    const stats = JSON.parse(localStorage.getItem('driving_stats')) || {total:0, night:0, weekly:0};
    const time = new Date().toLocaleTimeString();
    try {
        await setDoc(doc(db, "users", uid), { stats, lastUpdated: time }, { merge: true });
        const timeEl = document.getElementById('sync-time');
        if (timeEl) timeEl.textContent = time;
    } catch (e) { console.error(e); }
};

// PERSISTENCE LOOP: Checks 5 times over 5 seconds to ensure UI stays active
let checkCount = 0;
const persistenceInterval = setInterval(() => {
    renderUI();
    checkCount++;
    if (checkCount > 5) clearInterval(persistenceInterval);
}, 1000);
