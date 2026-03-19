// Settings Page Functionality
// Deletes from BOTH localStorage AND Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration (same as app.js)
const firebaseConfig = {
  apiKey: "AIzaSyCr5wvKZokrY0xwYo-Sbkzahzh8WknXHb4",
  authDomain: "lead-finder-pro-27bf2.firebaseapp.com",
  projectId: "lead-finder-pro-27bf2",
  storageBucket: "lead-finder-pro-27bf2.firebasestorage.app",
  messagingSenderId: "197510050244",
  appId: "1:197510050244:web:f2baf1b7ff0b81c1fb7491"
};

const app = initializeApp(firebaseConfig, 'settings-app');
const db = getFirestore(app);

const DEFAULT_REQUIREMENTS = {
    totalHours: 60,
    nightHours: 10,
    weeklyHours: 10
};

window.getRequirements = function() {
    const saved = localStorage.getItem('hour_requirements');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return {
                totalHours: Number(parsed.totalHours) || DEFAULT_REQUIREMENTS.totalHours,
                nightHours: Number(parsed.nightHours) || DEFAULT_REQUIREMENTS.nightHours,
                weeklyHours: Number(parsed.weeklyHours) || DEFAULT_REQUIREMENTS.weeklyHours
            };
        } catch (e) {
            return { ...DEFAULT_REQUIREMENTS };
        }
    }
    return { ...DEFAULT_REQUIREMENTS };
};

window.saveRequirements = function() {
    const totalEl = document.getElementById('req-total');
    const nightEl = document.getElementById('req-night');
    const weeklyEl = document.getElementById('req-weekly');
    
    if (!totalEl || !nightEl || !weeklyEl) return;
    
    const requirements = {
        totalHours: Math.max(0, parseInt(totalEl.value) || DEFAULT_REQUIREMENTS.totalHours),
        nightHours: Math.max(0, parseInt(nightEl.value) || DEFAULT_REQUIREMENTS.nightHours),
        weeklyHours: Math.max(0, parseInt(weeklyEl.value) || DEFAULT_REQUIREMENTS.weeklyHours)
    };
    
    localStorage.setItem('hour_requirements', JSON.stringify(requirements));
    
    if (window.loadDashboard) {
        window.loadDashboard();
    }
};

window.resetRequirements = function() {
    localStorage.removeItem('hour_requirements');
    
    const totalEl = document.getElementById('req-total');
    const nightEl = document.getElementById('req-night');
    const weeklyEl = document.getElementById('req-weekly');
    
    if (totalEl) totalEl.value = DEFAULT_REQUIREMENTS.totalHours;
    if (nightEl) nightEl.value = DEFAULT_REQUIREMENTS.nightHours;
    if (weeklyEl) weeklyEl.value = DEFAULT_REQUIREMENTS.weeklyHours;
    
    if (window.loadDashboard) {
        window.loadDashboard();
    }
};

window.loadSettingsData = function() {
    setTimeout(() => {
        const nameEl = document.getElementById('settings-name');
        const emailEl = document.getElementById('settings-email');
        
        if (nameEl) nameEl.textContent = localStorage.getItem('log_name') || 'N/A';
        if (emailEl) emailEl.textContent = localStorage.getItem('log_email') || 'N/A';
        
        const reqs = window.getRequirements();
        const totalEl = document.getElementById('req-total');
        const nightEl = document.getElementById('req-night');
        const weeklyEl = document.getElementById('req-weekly');
        
        if (totalEl) totalEl.value = reqs.totalHours;
        if (nightEl) nightEl.value = reqs.nightHours;
        if (weeklyEl) weeklyEl.value = reqs.weeklyHours;
        
        if (window.updateSettingsDisplay) {
            window.updateSettingsDisplay();
        }
        
        updateSupportSection();
    }, 100);
};

function updateSupportSection() {
    const supportBtn = document.getElementById('support-btn');
    const supportStatus = document.getElementById('support-status');
    
    const hasTipped = localStorage.getItem('ll_has_tipped') === 'true';
    
    if (hasTipped) {
        if (supportBtn) supportBtn.style.display = 'none';
        if (supportStatus) {
            supportStatus.style.display = 'block';
            supportStatus.innerHTML = '💚 Thank you for your support!';
        }
    } else {
        if (supportBtn) supportBtn.style.display = 'inline-flex';
        if (supportStatus) supportStatus.style.display = 'none';
    }
}

window.openSupportModal = function() {
    if (typeof TipSystem !== 'undefined') {
        TipSystem.showTipModal('settings');
    } else {
        alert('Support system not available. Please refresh the page.');
    }
};

// DELETE ALL DATA - FROM LOCALSTORAGE AND FIREBASE
window.deleteAllData = function() {
    const stats = window.getStats ? window.getStats() : { trips: [], totalHours: 0, nightHours: 0 };
    const tripCount = stats.trips.length;
    const totalHours = stats.totalHours.toFixed(1);
    
    if (tripCount === 0) {
        alert('No data to delete.');
        return;
    }
    
    if (!confirm('Delete ' + tripCount + ' trips (' + totalHours + ' hours)?\n\nThis will delete from this device AND the cloud.\n\nThis cannot be undone!')) {
        return;
    }
    
    if (prompt('Type DELETE to confirm:') !== 'DELETE') {
        alert('Cancelled.');
        return;
    }
    
    // Perform deletion
    performDeletion();
};

async function performDeletion() {
    const uid = localStorage.getItem('log_uid');
    
    // Show loading
    const deleteBtn = document.getElementById('delete-all-btn');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = '⏳ Deleting...';
    }
    
    try {
        // ============================================
        // STEP 1: Delete from localStorage
        // ============================================
        const emptyStats = {
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: []
        };
        
        localStorage.setItem('driving_stats', JSON.stringify(emptyStats));
        localStorage.removeItem('safety_check_complete');
        localStorage.removeItem('active_drive');
        
        // Remove route keys
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('route_')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('✓ Local data deleted');
        
        // ============================================
        // STEP 2: Delete from Firebase
        // ============================================
        if (uid) {
            try {
                const docRef = doc(db, "users", uid);
                await setDoc(docRef, {
                    stats: emptyStats,
                    lastUpdated: new Date().toLocaleString(),
                    userEmail: localStorage.getItem('log_email') || '',
                    userName: localStorage.getItem('log_name') || ''
                });
                console.log('✓ Cloud data deleted');
            } catch (firebaseError) {
                console.error('Firebase delete error:', firebaseError);
                // Continue anyway - local data is deleted
            }
        }
        
        // ============================================
        // STEP 3: Update UI directly
        // ============================================
        const totalProgress = document.getElementById('total-progress');
        const nightProgress = document.getElementById('night-progress');
        const weeklyProgress = document.getElementById('weekly-progress');
        
        if (totalProgress) totalProgress.style.width = '0%';
        if (nightProgress) nightProgress.style.width = '0%';
        if (weeklyProgress) weeklyProgress.style.width = '0%';
        
        const reqs = window.getRequirements ? window.getRequirements() : { totalHours: 60, nightHours: 10, weeklyHours: 10 };
        
        const totalHoursEl = document.getElementById('total-hours');
        const nightHoursEl = document.getElementById('night-hours');
        const weeklyHoursEl = document.getElementById('weekly-hours');
        
        if (totalHoursEl) totalHoursEl.textContent = '0.0/' + reqs.totalHours + 'h';
        if (nightHoursEl) nightHoursEl.textContent = '0.0/' + reqs.nightHours + 'h';
        if (weeklyHoursEl) weeklyHoursEl.textContent = '0.0/' + reqs.weeklyHours + 'h';
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) timerDisplay.textContent = '00:00:00';
        
        const timelineContainer = document.getElementById('timeline-container');
        if (timelineContainer) {
            timelineContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No trips recorded yet.</p>';
        }
        
        const dataSummary = document.getElementById('data-summary');
        if (dataSummary) {
            dataSummary.innerHTML = '<strong>0</strong> trips logged<br><strong>0.0</strong> hours total<br><strong>0.0</strong> night hours<br><strong>0</strong> GPS routes saved';
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.textContent = '🗑️ No Data to Delete';
        }
        
        // ============================================
        // STEP 4: Success
        // ============================================
        alert('✅ All data deleted from device and cloud!');
        
        if (window.showPage) {
            window.showPage('dashboard');
        }
        
    } catch (error) {
        console.error('Deletion error:', error);
        alert('Error: ' + error.message);
        
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = '🗑️ Delete All Driving Data';
        }
    }
}

window.getDataSummary = function() {
    const stats = window.getStats ? window.getStats() : { trips: [], totalHours: 0, nightHours: 0 };
    
    let routeCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('route_')) {
            routeCount++;
        }
    }
    
    return {
        trips: stats.trips.length,
        totalHours: stats.totalHours.toFixed(1),
        nightHours: stats.nightHours.toFixed(1),
        routes: routeCount
    };
};

window.updateSettingsDisplay = function() {
    const summary = window.getDataSummary();
    const summaryEl = document.getElementById('data-summary');
    
    if (summaryEl) {
        summaryEl.innerHTML = 
            '<strong>' + summary.trips + '</strong> trips logged<br>' +
            '<strong>' + summary.totalHours + '</strong> hours total<br>' +
            '<strong>' + summary.nightHours + '</strong> night hours<br>' +
            '<strong>' + summary.routes + '</strong> GPS routes saved';
    }
    
    const deleteBtn = document.getElementById('delete-all-btn');
    if (deleteBtn) {
        if (summary.trips === 0) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.textContent = '🗑️ No Data to Delete';
        } else {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.textContent = '🗑️ Delete All Driving Data';
        }
    }
};

console.log('Settings module loaded (with Firebase deletion)');
