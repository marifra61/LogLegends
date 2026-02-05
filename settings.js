// Settings Page Functionality
// Updated: Free model + Support/Tip button

// Default requirements (North Carolina)
const DEFAULT_REQUIREMENTS = {
    totalHours: 60,
    nightHours: 10,
    weeklyHours: 10
};

// Get current requirements from localStorage or defaults
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

// Save requirements to localStorage
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
    console.log('Requirements saved:', requirements);
    
    // Refresh dashboard progress bars if visible
    if (window.loadDashboard) {
        window.loadDashboard();
    }
};

// Reset to NC defaults
window.resetRequirements = function() {
    localStorage.removeItem('hour_requirements');
    
    const totalEl = document.getElementById('req-total');
    const nightEl = document.getElementById('req-night');
    const weeklyEl = document.getElementById('req-weekly');
    
    if (totalEl) totalEl.value = DEFAULT_REQUIREMENTS.totalHours;
    if (nightEl) nightEl.value = DEFAULT_REQUIREMENTS.nightHours;
    if (weeklyEl) weeklyEl.value = DEFAULT_REQUIREMENTS.weeklyHours;
    
    console.log('Requirements reset to NC defaults');
    
    // Refresh dashboard
    if (window.loadDashboard) {
        window.loadDashboard();
    }
};

// Load settings page data - called directly from nav button onclick
window.loadSettingsData = function() {
    setTimeout(() => {
        // Update user info
        const nameEl = document.getElementById('settings-name');
        const emailEl = document.getElementById('settings-email');
        
        if (nameEl) nameEl.textContent = localStorage.getItem('log_name') || 'N/A';
        if (emailEl) emailEl.textContent = localStorage.getItem('log_email') || 'N/A';
        
        // Populate hour requirement inputs with current values
        const reqs = window.getRequirements();
        const totalEl = document.getElementById('req-total');
        const nightEl = document.getElementById('req-night');
        const weeklyEl = document.getElementById('req-weekly');
        
        if (totalEl) totalEl.value = reqs.totalHours;
        if (nightEl) nightEl.value = reqs.nightHours;
        if (weeklyEl) weeklyEl.value = reqs.weeklyHours;
        
        // Update data summary and delete button
        if (window.updateSettingsDisplay) {
            window.updateSettingsDisplay();
        }
        
        // Update support section
        updateSupportSection();
        
        console.log('Settings data loaded');
    }, 100);
};

// Update the Support LogLegends section based on tip status
function updateSupportSection() {
    const supportSection = document.getElementById('support-section');
    const supportBtn = document.getElementById('support-btn');
    const supportStatus = document.getElementById('support-status');
    
    if (!supportSection) return;
    
    const hasTipped = localStorage.getItem('ll_has_tipped') === 'true';
    
    if (hasTipped) {
        // User has already tipped - show thank you state
        if (supportBtn) supportBtn.style.display = 'none';
        if (supportStatus) {
            supportStatus.style.display = 'block';
            supportStatus.innerHTML = '💚 Thank you for your support!';
        }
    } else {
        // User hasn't tipped - show support button
        if (supportBtn) supportBtn.style.display = 'inline-flex';
        if (supportStatus) supportStatus.style.display = 'none';
    }
}

// Open support/tip modal from settings
window.openSupportModal = function() {
    if (typeof TipSystem !== 'undefined') {
        TipSystem.showTipModal('settings');
    } else {
        console.error('TipSystem not loaded');
        alert('Support system not available. Please refresh the page.');
    }
};

// Delete all data with multiple safeguards
window.deleteAllData = function() {
    // Step 1: Get current stats
    const stats = window.getStats ? window.getStats() : { trips: [], totalHours: 0, nightHours: 0 };
    const tripCount = stats.trips.length;
    const totalHours = stats.totalHours.toFixed(1);
    const nightHours = stats.nightHours.toFixed(1);
    
    // Step 2: Check if there's any data to delete
    if (tripCount === 0) {
        alert('You have no driving data to delete.');
        return;
    }
    
    // Step 3: First confirmation - Show what will be deleted
    const confirmMessage = `⚠️ WARNING: Delete ALL Driving Data?

This will PERMANENTLY delete:
• ${tripCount} trip${tripCount === 1 ? '' : 's'}
• ${totalHours} hours of driving time
• ${nightHours} night hours
• All GPS routes and maps

❌ This action CANNOT be undone!
❌ You will lose proof of hours for DMV!

Do you want to continue?`;
    
    if (!confirm(confirmMessage)) {
        console.log('Deletion cancelled at step 1');
        return;
    }
    
    // Step 4: Offer to export PDF first
    const exportFirst = confirm(`📄 Export PDF Backup First?

Before deleting, would you like to save a PDF copy of your driving log?

This is your LAST CHANCE to save this data.

Export PDF before deleting?`);
    
    if (exportFirst) {
        // Export PDF first (no premium check needed - it's free now!)
        if (window.exportToPDF) {
            try {
                window.exportToPDF();
                alert('PDF exported!\n\nNow proceeding with deletion...');
            } catch (error) {
                alert('PDF export failed. Cancelling deletion for safety.');
                return;
            }
        }
        
        // Wait a moment for export to complete
        setTimeout(() => {
            continueWithDeletion(tripCount, totalHours);
        }, 1000);
    } else {
        // Continue without export
        continueWithDeletion(tripCount, totalHours);
    }
};

function continueWithDeletion(tripCount, totalHours) {
    // Step 5: Type "DELETE" confirmation
    const typedConfirmation = prompt(`🔴 Type DELETE to Confirm

You are about to delete ${tripCount} trips (${totalHours} hours).

Type the word DELETE in all caps to proceed:`);
    
    if (typedConfirmation !== 'DELETE') {
        alert('Deletion cancelled.\n\nYour data is safe.');
        console.log('Deletion cancelled at step 2 - wrong text');
        return;
    }
    
    // Step 6: Final warning
    const finalConfirm = confirm(`🚨 FINAL WARNING 🚨

This is your LAST CHANCE to cancel.

After clicking OK:
• All ${tripCount} trips will be DELETED
• All ${totalHours} hours will be LOST
• GPS routes will be ERASED
• This CANNOT be reversed

Are you ABSOLUTELY SURE?`);
    
    if (!finalConfirm) {
        alert('Deletion cancelled.\n\nYour data is safe.');
        console.log('Deletion cancelled at final step');
        return;
    }
    
    // Step 7: Actually delete everything
    performDeletion();
}

function performDeletion() {
    try {
        console.log('Starting data deletion...');
        
        // Delete main driving stats
        localStorage.removeItem('driving_stats');
        
        // Delete safety check status
        localStorage.removeItem('safety_check_complete');
        
        // Delete active drive state
        localStorage.removeItem('active_drive');
        
        // Delete all route data
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('route_')) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Deleted', keysToDelete.length, 'route files');
        console.log('All driving data deleted successfully');
        
        // Show success message
        alert(`✅ All Data Deleted

• ${keysToDelete.length} route files removed
• Driving stats cleared
• Active drive cleared
• Safety checklist reset

You can now start fresh!`);
        
        // Reload the app to reset everything
        location.reload();
        
    } catch (error) {
        console.error('Error during deletion:', error);
        alert('❌ Error deleting data.\n\nSome data may not have been deleted. Please try again or contact support.');
    }
}

// Show what data exists (for settings page)
window.getDataSummary = function() {
    const stats = window.getStats ? window.getStats() : { trips: [], totalHours: 0, nightHours: 0 };
    
    // Count route files
    let routeCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('route_')) {
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

// Update settings display
window.updateSettingsDisplay = function() {
    const summary = window.getDataSummary();
    const summaryEl = document.getElementById('data-summary');
    
    if (summaryEl) {
        summaryEl.innerHTML = `
            <strong>${summary.trips}</strong> trips logged<br>
            <strong>${summary.totalHours}</strong> hours total<br>
            <strong>${summary.nightHours}</strong> night hours<br>
            <strong>${summary.routes}</strong> GPS routes saved
        `;
    }
    
    // Enable/disable delete button based on data
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

console.log('Settings module loaded (free + tips)');
