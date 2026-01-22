window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + pageId);
    const targetNav = document.getElementById('nav-' + (pageId === 'dashboard' ? 'dash' : pageId.substring(0, 4)));
    
    if (targetPage) targetPage.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
    console.log('Navigating to:', pageId);
};import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
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

// 1. GLOBAL LOGIN HANDLER
window.handleCredentialResponse = async (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('log_uid', payload.sub);
    localStorage.setItem('log_name', payload.name);
    localStorage.setItem('log_pic', payload.picture);
    location.reload(); // Hard reset to trigger cloud pull
};

// 2. UI SYNC FUNCTION
function syncProfileUI(time) {
    const uid = localStorage.getItem('log_uid');
    if (!uid) return;
    
    document.getElementById('google-login-btn').style.display = 'none';
    const area = document.getElementById('sync-status-area');
    area.style.display = 'block';
    
    document.getElementById('user-info').innerHTML = `
        <img src="${localStorage.getItem('log_pic')}" style="border-radius:50%; width:45px; border:2px solid #00e5ff;">
        <p style="color:white; font-weight:bold; margin:5px 0;">${localStorage.getItem('log_name')}</p>
    `;
    document.getElementById('sync-time').textContent = time || "Active";
}

// 3. STARTUP SEQUENCE
async function init() {
    const uid = localStorage.getItem('log_uid');
    if (uid) {
        syncProfileUI("Restoring...");
        try {
            const snap = await getDoc(doc(db, "users", uid));
            if (snap.exists()) {
                const cloud = snap.data();
                localStorage.setItem('driving_stats', JSON.stringify(cloud.stats));
                syncProfileUI(cloud.lastUpdated);
            }
        } catch (e) { console.error(e); }
    }
    // Now trigger the rest of your original driving logic here...
    console.log("App Initialized");
}

init();

// Placeholder for your original driving functions (showPage, etc.)
window.showPage = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
};

