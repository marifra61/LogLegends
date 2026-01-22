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

// 1. Make the callback GLOBAL so Google can find it
window.handleCredentialResponse = async function(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);

    await window.syncToCloud();
    updateLoggedInUI(payload.name, payload.picture, new Date().toLocaleTimeString());
};

// 2. The UI Update Engine
function updateLoggedInUI(name, picture, timestamp) {
    const signinBtn = document.querySelector(".g_id_signin");
    const syncArea = document.getElementById('sync-status-area');
    const userInfo = document.getElementById('user-info');
    const timeSpan = document.getElementById('sync-time');

    if (signinBtn) signinBtn.style.display = "none";
    if (syncArea) syncArea.style.display = "block";
    if (userInfo) {
        userInfo.innerHTML = `
            <img src="${picture}" style="border-radius:50%; width:50px; border: 2px solid #00e5ff;">
            <p style="margin: 5px 0 0 0; font-weight: bold; color: white;">${name}</p>
        `;
    }
    if (timeSpan && timestamp) timeSpan.textContent = timestamp;
}

// 3. The Cloud Sync Engine
window.syncToCloud = async function() {
    const userId = localStorage.getItem('loglegends_user_id');
    if (!userId) return;

    const timestamp = new Date().toLocaleTimeString();
    try {
        // Use a fallback if 'stats' isn't defined yet
        const currentStats = (typeof stats !== 'undefined') ? stats : { total: 0, night: 0, weekly: 0 };
        await setDoc(doc(db, "users", userId), { 
            stats: currentStats,
            lastUpdated: timestamp 
        }, { merge: true });
        
        const timeSpan = document.getElementById('sync-time');
        if (timeSpan) timeSpan.textContent = timestamp;
    } catch (e) {
        console.error("Firebase Sync Error:", e);
    }
};

// 4. Run Restore immediately
async function restoreSession() {
    const savedId = localStorage.getItem('loglegends_user_id');
    if (savedId) {
        const name = localStorage.getItem('loglegends_user_name');
        const pic = localStorage.getItem('loglegends_user_pic');
        updateLoggedInUI(name, pic, "Connecting...");
        
        try {
            const docSnap = await getDoc(doc(db, "users", savedId));
            if (docSnap.exists()) {
                updateLoggedInUI(name, pic, docSnap.data().lastUpdated);
            }
        } catch (e) {
            console.error("Session Restore Error:", e);
        }
    }
}
restoreSession();
