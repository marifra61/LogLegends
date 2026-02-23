// Settings Page Functionality
// DEBUG VERSION - alerts show what's happening

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

// DELETE ALL DATA
window.deleteAllData = function() {
    const stats = window.getStats ? window.getStats() : { trips: [], totalHours: 0, nightHours: 0 };
    const tripCount = stats.trips.length;
    const totalHours = stats.totalHours.toFixed(1);
    
    if (tripCount === 0) {
        alert('No data to delete.');
        return;
    }
    
    if (!confirm('Delete ' + tripCount + ' trips (' + totalHours + ' hours)?\n\nThis cannot be undone!')) {
        return;
    }
    
    if (prompt('Type DELETE to confirm:') !== 'DELETE') {
        alert('Cancelled.');
        return;
    }
    
    // === DEBUG: Show data BEFORE deletion ===
    const beforeData = localStorage.getItem('driving_stats');
    const beforeParsed = JSON.parse(beforeData || '{}');
    alert('BEFORE DELETE:\nTrips: ' + (beforeParsed.trips ? beforeParsed.trips.length : 0) + '\nHours: ' + (beforeParsed.totalHours || 0).toFixed(1));
    
    // === PERFORM DELETION ===
    try {
        // Method 1: Remove the key
        localStorage.removeItem('driving_stats');
        
        // Method 2: Also overwrite with empty data
        const emptyData = JSON.stringify({
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: []
        });
        localStorage.setItem('driving_stats', emptyData);
        
        // Remove other keys
        localStorage.removeItem('safety_check_complete');
        localStorage.removeItem('active_drive');
        
        // Remove route keys
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('route_')) {
                localStorage.removeItem(key);
            }
        });
        
    } catch (err) {
        alert('ERROR during deletion:\n' + err.message);
        return;
    }
    
    // === DEBUG: Show data AFTER deletion ===
    const afterData = localStorage.getItem('driving_stats');
    const afterParsed = JSON.parse(afterData || '{}');
    alert('AFTER DELETE:\nTrips: ' + (afterParsed.trips ? afterParsed.trips.length : 0) + '\nHours: ' + (afterParsed.totalHours || 0).toFixed(1));
    
    // === DEBUG: Verify with getStats ===
    const verifyStats = window.getStats ? window.getStats() : {};
    alert('VERIFY getStats():\nTrips: ' + (verifyStats.trips ? verifyStats.trips.length : 0) + '\nHours: ' + (verifyStats.totalHours || 0).toFixed(1));
    
    alert('Deletion complete. Please close and reopen the app.');
};

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

console.log('Settings DEBUG version loaded');
