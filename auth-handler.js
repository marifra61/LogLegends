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

window.handleCredentialResponse = async (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);
    
    renderUI(payload.name, payload.picture, "Syncing...");
    await window.syncToCloud();
};

function renderUI(name, pic, time) {
    const area = document.getElementById('sync-status-area');
    const btn = document.querySelector(".g_id_signin");
    if (area) area.style.display = "block";
    if (btn) btn.style.display = "none";
    
    document.getElementById('user-info').innerHTML = `
        <img src="${pic}" style="border-radius:50%; width:45px; border:2px solid #00e5ff;">
        <p style="color:white; margin:5px 0; font-weight:bold;">${name}</p>
    `;
    document.getElementById('sync-time').textContent = time;
}

window.syncToCloud = async () => {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;
    
    // FETCH DATA DIRECTLY FROM STORAGE TO PREVENT SCOPE ERRORS
    const localStats = JSON.parse(localStorage.getItem('driving_stats')) || {total: 0, night: 0, weekly: 0};
    const time = new Date().toLocaleTimeString();
    
    try {
        await setDoc(doc(db, "users", uid), { stats: localStats, lastUpdated: time }, { merge: true });
        document.getElementById('sync-time').textContent = time;
    } catch (e) { console.error("Cloud Sync Error:", e); }
};

// INITIAL LOAD CHECK
const savedId = localStorage.getItem('loglegends_user_id');
if (savedId) {
    renderUI(localStorage.getItem('loglegends_user_name'), localStorage.getItem('loglegends_user_pic'), "Session Active");
}
