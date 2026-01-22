// Dashboard functionality

let driveStartTime = null;
let driveInterval = null;
let startLocation = null;

// Load and display dashboard stats
window.loadDashboard = function() {
    const stats = window.getStats ? window.getStats() : {
        totalHours: 0,
        nightHours: 0,
        weeklyHours: 0
    };
    
    // Update progress bars and values
    updateStat('total', stats.totalHours, 60);
    updateStat('night', stats.nightHours, 10);
    updateStat('weekly', stats.weeklyHours, 10);
    
    console.log('Dashboard loaded:', stats);
};

function updateStat(type, current, max) {
    const percentage = Math.min((current / max) * 100, 100);
    const progressBar = document.getElementById(`${type}-progress`);
    const valueDisplay = document.getElementById(`${type}-hours`);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (valueDisplay) {
        valueDisplay.textContent = current.toFixed(1) + 'h';
    }
}

// Start a driving session
window.startDrive = function() {
    // Check if safety check is complete
    const safetyComplete = localStorage.getItem('safety_check_complete');
    if (safetyComplete !== 'true') {
        alert('Please complete the safety checklist first!');
        if (window.showPage) {
            window.showPage('checklist');
        }
        return;
    }
    
    const startBtn = document.getElementById('start-drive-btn');
    const safetyStatus = document.getElementById('safety-status');
    
    if (driveStartTime) {
        // Stop the drive
        stopDrive();
    } else {
        // Start the drive
        driveStartTime = new Date();
        
        // Get GPS location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    startLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Start location:', startLocation);
                },
                (error) => {
                    console.log('GPS error:', error);
                    startLocation = null;
                }
            );
        }
        
        // Update UI
        if (startBtn) {
            startBtn.textContent = 'STOP DRIVE';
            startBtn.classList.add('active');
        }
        
        if (safetyStatus) {
            safetyStatus.textContent = '🚗 Drive in Progress';
            safetyStatus.style.background = 'linear-gradient(90deg, #ff6b35, #ff8c42)';
        }
        
        // Start timer
        driveInterval = setInterval(updateTimer, 1000);
        
        console.log('Drive started at', driveStartTime);
    }
};

function stopDrive() {
    if (!driveStartTime) return;
    
    const endTime = new Date();
    const durationMs = endTime - driveStartTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Get end location
    let endLocation = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                endLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Save the trip
                saveTrip(durationHours, endLocation);
            },
            (error) => {
                console.log('GPS error on stop:', error);
                saveTrip(durationHours, null);
            }
        );
    } else {
        saveTrip(durationHours, null);
    }
}

function saveTrip(durationHours, endLocation) {
    const trip = {
        id: Date.now(),
        startTime: driveStartTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: durationHours,
        isNight: window.isNightTime ? window.isNightTime() : false,
        startLocation: startLocation,
        endLocation: endLocation
    };
    
    // Add trip to stats
    if (window.addTrip) {
        window.addTrip(trip);
    }
    
    // Reset UI
    const startBtn = document.getElementById('start-drive-btn');
    const safetyStatus = document.getElementById('safety-status');
    const timerDisplay = document.getElementById('timer-display');
    
    if (startBtn) {
        startBtn.textContent = 'START DRIVE';
        startBtn.classList.remove('active');
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
    }
    
    if (safetyStatus) {
        safetyStatus.textContent = 'Safety Check Required';
        safetyStatus.style.background = 'linear-gradient(90deg, #ff6b35, #ff8c42)';
    }
    
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
    
    // Clear interval
    if (driveInterval) {
        clearInterval(driveInterval);
        driveInterval = null;
    }
    
    // Reset checklist
    localStorage.removeItem('safety_check_complete');
    
    // Reset variables
    driveStartTime = null;
    startLocation = null;
    
    // Reload dashboard stats
    window.loadDashboard();
    
    // Push to cloud if logged in
    if (window.pushToCloud) {
        window.pushToCloud();
    }
    
    alert(`Drive complete! Duration: ${durationHours.toFixed(2)} hours`);
    
    console.log('Drive stopped, trip saved:', trip);
}

function updateTimer() {
    if (!driveStartTime) return;
    
    const now = new Date();
    const elapsed = now - driveStartTime;
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    const timeStr = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = timeStr;
    }
}

// Load dashboard on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.loadDashboard);
} else {
    window.loadDashboard();
}

console.log('Dashboard module loaded');
