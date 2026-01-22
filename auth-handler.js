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

// GLOBAL BRIDGE
window.handleCredentialResponse = async (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log("Login Success for:", payload.name);
    
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);

    showCloudUI(payload.name, payload.picture, "Syncing...");
    await window.syncToCloud();
};

function showCloudUI(name, pic, time) {
    const area = document.getElementById('sync-status-area');
    const btn = document.querySelector(".g_id_signin");
    
    if (area) {
        area.setAttribute('style', 'display: block !important; margin-top: 20px; padding: 15px; background: #111; border-radius: 10px;');
    }
    if (btn) btn.style.display = "none";
    
    document.getElementById('user-info').innerHTML = `
        <img src="${pic}" style="border-radius:50%; width:50px; border: 2px solid #00e5ff;">
        <p style="color:white; font-weight:bold; margin-top:5px;">${name}</p>
    `;
    document.getElementById('sync-time').textContent = time;
}

window.syncToCloud = async () => {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;
    const time = new Date().toLocaleTimeString();
    try {
        await setDoc(doc(db, "users", uid), { 
            stats: (window.stats || {total:0, night:0, weekly:0}),
            lastUpdated: time 
        }, { merge: true });
        document.getElementById('sync-time').textContent = time;
    } catch (e) { console.error(e); }
};

// AUTO-RESTORE
const savedId = localStorage.getItem('loglegends_user_id');
if (savedId) {
    showCloudUI(
        localStorage.getItem('loglegends_user_name'),
        localStorage.getItem('loglegends_user_pic'),
        "Last session restored"
    );
}
