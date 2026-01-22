// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
  authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
  projectId: "lead-finder-pro-27bf2",
  storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
  messagingSenderId: "197510050244",
  appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// NAVIGATION
// ============================================
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + pageId);
    const targetNav = document.getElementById('nav-' + (pageId === 'dashboard' ? 'dash' : pageId.substring(0, 4)));
    
    if (targetPage) targetPage.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
    console.log('Navigating to:', pageId);
};

// ============================================
// UI SYNC FUNCTION
// ============================================
function syncProfileUI(time) {
    const uid = localStorage.getItem('log_uid');
    if (!uid) return;
    
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) loginBtn.style.display = 'none';
    
    const syncArea = document.getElementById('sync-status-area');
    if (syncArea) syncArea.style.display = 'block';
    
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const name = localStorage.getItem('log_name') || 'User';
        const pic = localStorage.getItem('log_pic') || '';
        
        userInfo.innerHTML = `
            <img src="${pic}" style="border-radius:50%; width:45px; border:2px solid #00e5ff;" alt="Profile">
            <p style="color:white; font-weight:bold; margin:5px 0;">${name}</p>
        `;
    }
    
    const syncTime = document.getElementById('sync-time');
    if (syncTime) syncTime.textContent = time || "Active";
}

// ============================================
// CLOUD SYNC FUNCTIONS
// ============================================
async function pullFromCloud() {
    const uid = localStorage.getItem('log_uid');
    if (!uid) return;
    
    try {
        const docRef = doc(db, "users", uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            const cloudData = snap.data();
            if (cloudData.stats) {
                localStorage.setItem('driving_stats', JSON.stringify(cloudData.stats));
                console.log('Cloud data synced:', cloudData);
                syncProfileUI(cloudData.lastUpdated || 'Just now');
                
                // Refresh dashboard if it exists
                if (window.loadDashboard) {
                    window.loadDashboard();
                }
            }
        } else {
            console.log('No cloud data found, using local data');
        }
    } catch (error) {
        console.error('Error pulling from cloud:', error);
    }
}

window.pushToCloud = async function() {
    const uid = localStorage.getItem('log_uid');
    if (!uid) {
        console.log('No user logged in');
        return;
    }
    
    try {
        const statsStr = localStorage.getItem('driving_stats');
        const stats = statsStr ? JSON.parse(statsStr) : {
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: []
        };
        
        const docRef = doc(db, "users", uid);
        await setDoc(docRef, {
            stats: stats,
            lastUpdated: new Date().toLocaleString(),
            userEmail: localStorage.getItem('log_email') || ''
        }, { merge: true });
        
        console.log('Data pushed to cloud');
        syncProfileUI('Just now');
    } catch (error) {
        console.error('Error pushing to cloud:', error);
    }
};

// ============================================
// LOGOUT FUNCTION
// ============================================
window.logoutUser = function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('log_uid');
        localStorage.removeItem('log_name');
        localStorage.removeItem('log_pic');
        localStorage.removeItem('log_email');
        location.reload();
    }
};

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    console.log('Initializing LogLegends...');
    
    const uid = localStorage.getItem('log_uid');
    if (uid) {
        console.log('User logged in, syncing...');
        syncProfileUI("Syncing...");
        await pullFromCloud();
    } else {
        console.log('No user logged in');
    }
    
    // Re-attach button listeners
    attachEventListeners();
    
    console.log('App initialized successfully');
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    const startBtn = document.getElementById('start-drive-btn');
    if (startBtn && window.startDrive) {
        startBtn.onclick = window.startDrive;
    }
    
    const verifyBtn = document.getElementById('complete-checklist-btn');
    if (verifyBtn && window.validateChecklist) {
        verifyBtn.onclick = window.validateChecklist;
    }
    
    console.log('Event listeners attached');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
