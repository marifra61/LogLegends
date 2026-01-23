// Dashboard functionality with Firebase-compatible GPS tracking

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

// Start a driving session with GPS tracking
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
        
        // Replace map placeholder with actual map
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.innerHTML = '<div id="map-container" style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden;"></div>';
            
            // Initialize map after DOM update
            setTimeout(() => {
                if (window.initMap) {
                    window.initMap();
                }
            }, 100);
        }
        
        // Get GPS location and start tracking
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    startLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Start location:', startLocation);
                    
                    // Start route tracking
                    if (window.startRouteTracking) {
                        window.startRouteTracking(startLocation);
                    }
                },
                (error) => {
                    console.log('GPS error:', error);
                    startLocation = null;
                    alert('⚠️ GPS not available. Drive will be recorded without location data.');
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
    
    // Get end location and stop tracking
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const endLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Stop tracking and get route data
                let routeData = null;
                if (window.stopRouteTracking) {
                    routeData = window.stopRouteTracking(endLocation);
                }
                
                // Save the trip with route data
                saveTrip(durationHours, endLocation, routeData);
            },
            (error) => {
                console.log('GPS error on stop:', error);
                
                // Stop tracking anyway
                if (window.stopRouteTracking) {
                    window.stopRouteTracking(null);
                }
                
                saveTrip(durationHours, null, null);
            }
        );
    } else {
        saveTrip(durationHours, null, null);
    }
}

function saveTrip(durationHours, endLocation, routeData) {
    // Create Firebase-compatible trip object
    const trip = {
        id: Date.now(),
        startTime: driveStartTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: durationHours,
        isNight: window.isNightTime ? window.isNightTime() : false,
        startLocation: startLocation ? {
            lat: Number(startLocation.lat.toFixed(6)),
            lng: Number(startLocation.lng.toFixed(6))
        } : null,
        endLocation: endLocation ? {
            lat: Number(endLocation.lat.toFixed(6)),
            lng: Number(endLocation.lng.toFixed(6))
        } : null,
        distance: routeData && routeData.distance ? Number(routeData.distance.toFixed(2)) : null
    };
    
    // Store full route data separately in localStorage for viewing
    // Don't send to Firebase (too large)
    if (routeData && routeData.points && routeData.points.length > 0) {
        // Limit route points to reduce size (keep every Nth point for large routes)
        let routePoints = routeData.points;
        if (routePoints.length > 20) {
            // Keep first, last, and sample points in between
            const step = Math.floor(routePoints.length / 18);
            const sampledPoints = [routePoints[0]]; // First point
            for (let i = step; i < routePoints.length - 1; i += step) {
                sampledPoints.push(routePoints[i]);
            }
            sampledPoints.push(routePoints[routePoints.length - 1]); // Last point
            routePoints = sampledPoints;
        }
        
        // Round coordinates to 6 decimal places (enough precision)
        const cleanRoute = routePoints.map(point => [
            Number(point[0].toFixed(6)),
            Number(point[1].toFixed(6))
        ]);
        
        // Store route in separate localStorage key for this trip
        localStorage.setItem(`route_${trip.id}`, JSON.stringify(cleanRoute));
        
        // Don't include route in trip object sent to Firebase
        console.log('Route stored locally with', cleanRoute.length, 'points');
    }
    
    // Add trip to stats (this updates localStorage)
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
    
    // Clear map and restore placeholder
    if (window.clearMap) {
        window.clearMap();
    }
    
    const mapContainer = document.getElementById('map-container');
    if (mapContainer && mapContainer.parentElement) {
        mapContainer.parentElement.innerHTML = `
            <div class="map-placeholder">
                <p>🗺️</p>
                <small>GPS tracking active during drive</small>
            </div>
        `;
    }
    
    // Reload dashboard stats
    window.loadDashboard();
    
    // Show summary
    const distanceText = trip.distance ? ` (${trip.distance.toFixed(2)} miles)` : '';
    alert(`Drive complete! Duration: ${durationHours.toFixed(2)} hours${distanceText}`);
    
    // Push to cloud AFTER showing success message
    console.log('Attempting to sync trip to cloud...');
    if (window.pushToCloud) {
        setTimeout(() => {
            window.pushToCloud();
        }, 500);
    }
    
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

console.log('Dashboard module with Firebase-compatible GPS tracking loaded');
