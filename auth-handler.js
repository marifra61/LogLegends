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

// Function to update the UI once logged in
function updateLoggedInUI(name, picture, timestamp) {
    const signinBtn = document.querySelector(".g_id_signin");
    if (signinBtn) signinBtn.style.display = "none";
    
    const syncArea = document.getElementById('sync-status-area');
    if (syncArea) syncArea.style.display = 'block';
    
    document.getElementById('user-info').innerHTML = `
        <img src="${picture}" style="border-radius:50%; width:50px; border: 2px solid #00e5ff;">
        <p style="margin: 5px 0 0 0; font-weight: bold; color: white;">${name}</p>
    `;
    
    if (timestamp) {
        document.getElementById('sync-time').textContent = timestamp;
    }
}

window.handleCredentialResponse = async function(response) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);

    await window.syncToCloud();
    updateLoggedInUI(payload.name, payload.picture, new Date().toLocaleTimeString());
};

window.syncToCloud = async function() {
    const userId = localStorage.getItem('loglegends_user_id');
    if (!userId) return;

    const timestamp = new Date().toLocaleTimeString();
    try {
        await setDoc(doc(db, "users", userId), { 
            stats: (typeof stats !== 'undefined') ? stats : { total: 0, night: 0, weekly: 0 },
            lastUpdated: timestamp 
        }, { merge: true });
        
        document.getElementById('sync-time').textContent = timestamp;
    } catch (e) {
        console.error("Sync error:", e);
    }
};

// AUTO-RESTORE ON LOAD
window.addEventListener('load', async () => {
    const savedId = localStorage.getItem('loglegends_user_id');
    if (savedId) {
        const name = localStorage.getItem('loglegends_user_name');
        const pic = localStorage.getItem('loglegends_user_pic');
        
        // Fetch latest timestamp from Firebase
        const docSnap = await getDoc(doc(db, "users", savedId));
        const cloudTime = docSnap.exists() ? docSnap.data().lastUpdated : "Just now";
        
        updateLoggedInUI(name, pic, cloudTime);
    }
});
