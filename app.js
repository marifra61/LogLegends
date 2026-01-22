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
// CLOUD SYNC FUNCTIONS WITH TIMEOUT
// ============================================
async function pullFromCloud() {
    const uid = localStorage.getItem('log_uid');
    if (!uid) return;
    
    console.log('Attempting to sync from cloud...');
    
    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sync timeout')), 5000);
    });
    
    // Create the actual sync promise
    const syncPromise = (async () => {
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
                return true;
            }
        } else {
            console.log('No cloud data found, using local data');
            syncProfileUI('Local Mode');
            return false;
        }
    })();
    
    // Race between timeout and actual sync
    try {
        await Promise.race([syncPromise, timeoutPromise]);
    } catch (error) {
        console.warn('Cloud sync failed or timed out:', error.message);
        syncProfileUI('Offline Mode');
        
        // Show user-friendly message
        const syncTime = document.getElementById('sync-time');
        if (syncTime) {
            syncTime.textContent = 'Offline Mode';
            syncTime.style.color = '#ff9800';
        }
    }
}

window.pushToCloud = async function() {
    const uid = localStorage.getItem('log_uid');
    if (!uid) {
        console.log('No user logged in');
        return;
    }
    
    console.log('Pushing data to cloud...');
    
    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Push timeout')), 5000);
    });
    
    // Create the actual push promise
    const pushPromise = (async () => {
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
        
        console.log('Data pushed to cloud successfully');
        syncProfileUI('Just now');
    })();
    
    // Race between timeout and actual push
    try {
        await Promise.race([pushPromise, timeoutPromise]);
    } catch (error) {
        console.warn('Cloud push failed or timed out:', error.message);
        alert('Could not sync to cloud. Your data is saved locally.');
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
        
        // Try to sync, but don't block app initialization
        pullFromCloud().then(() => {
            console.log('Sync complete');
        }).catch(err => {
            console.warn('Sync failed:', err);
        });
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
