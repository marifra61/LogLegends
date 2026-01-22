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

// FORCE UI TO SHOW LOGGED IN STATE
function renderLoggedInUI() {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;

    const area = document.getElementById('sync-status-area');
    const btn = document.querySelector(".g_id_signin");
    if (area) area.style.setProperty('display', 'block', 'important');
    if (btn) btn.style.display = "none";
    
    const name = localStorage.getItem('loglegends_user_name');
    const pic = localStorage.getItem('loglegends_user_pic');
    const info = document.getElementById('user-info');
    if (info) {
        info.innerHTML = `<img src="${pic}" style="border-radius:50%; width:45px; border:2px solid #00e5ff;"><p style="color:white; font-weight:bold;">${name}</p>`;
    }
}

window.handleCredentialResponse = async (response) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem('loglegends_user_id', payload.sub);
    localStorage.setItem('loglegends_user_name', payload.name);
    localStorage.setItem('loglegends_user_pic', payload.picture);
    
    renderLoggedInUI();
    await window.syncToCloud();
    location.reload(); // Refresh once to let app.js grab the new cloud stats
};

window.syncToCloud = async () => {
    const uid = localStorage.getItem('loglegends_user_id');
    if (!uid) return;
    const stats = JSON.parse(localStorage.getItem('driving_stats')) || {total:0, night:0, weekly:0};
    try {
        const time = new Date().toLocaleTimeString();
        await setDoc(doc(db, "users", uid), { stats, lastUpdated: time }, { merge: true });
        if (document.getElementById('sync-time')) document.getElementById('sync-time').textContent = time;
    } catch (e) { console.error(e); }
};

// AUTO-RESTORE ON STARTUP
(async () => {
    const uid = localStorage.getItem('loglegends_user_id');
    if (uid) {
        renderLoggedInUI();
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                // OVERWRITE LOCAL STATS WITH CLOUD STATS BEFORE APP.JS RUNS
                localStorage.setItem('driving_stats', JSON.stringify(cloudData.stats));
                if (document.getElementById('sync-time')) document.getElementById('sync-time').textContent = cloudData.lastUpdated;
                console.log("Cloud data restored successfully.");
            }
        } catch (e) { console.error("Restore failed:", e); }
    }
})();
