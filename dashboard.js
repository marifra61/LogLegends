// Dashboard functionality with Battery Saver and Weather Tracking

let driveStartTime = null;
let driveInterval = null;
let startLocation = null;
let wakeLock = null;
let driveWeather = null;

// Check if battery saver is enabled
function isBatterySaver() {
    return localStorage.getItem('battery_saver') === 'true';
}

// Fetch weather conditions from Open-Meteo (free, no API key)
async function fetchWeather(lat, lng) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,precipitation&temperature_unit=fahrenheit`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        const current = data.current;
        
        // Convert weather code to description
        const weatherDesc = getWeatherDescription(current.weather_code);
        
        return {
            temp: Math.round(current.temperature_2m),
            condition: weatherDesc,
            windSpeed: Math.round(current.wind_speed_10m),
            precipitation: current.precipitation,
            code: current.weather_code
        };
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// Convert WMO weather codes to descriptions
function getWeatherDescription(code) {
    const codes = {
        0: 'Clear',
        1: 'Mostly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        56: 'Freezing Drizzle',
        57: 'Freezing Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        66: 'Freezing Rain',
        67: 'Freezing Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Light Showers',
        81: 'Showers',
        82: 'Heavy Showers',
        85: 'Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm w/ Hail',
        99: 'Thunderstorm w/ Hail'
    };
    return codes[code] || 'Unknown';
}

// Request wake lock (skipped in battery saver mode)
async function requestWakeLock() {
    if (isBatterySaver()) {
        console.log('Battery Saver ON - skipping wake lock');
        return;
    }
    
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated');
            
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
            });
        }
    } catch (err) {
        console.error('Wake Lock error:', err);
    }
}

// Release wake lock
async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock released manually');
        } catch (err) {
            console.error('Wake Lock release error:', err);
        }
    }
}

// Save active drive state
function saveDriveState() {
    if (driveStartTime) {
        const driveState = {
            startTime: driveStartTime.toISOString(),
            startLocation: startLocation,
            weather: driveWeather,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('active_drive', JSON.stringify(driveState));
        console.log('Drive state saved');
    }
}

// Restore active drive state
function restoreDriveState() {
    const savedState = localStorage.getItem('active_drive');
    if (savedState) {
        try {
            const driveState = JSON.parse(savedState);
            driveStartTime = new Date(driveState.startTime);
            startLocation = driveState.startLocation;
            driveWeather = driveState.weather || null;
            
            const startBtn = document.getElementById('start-drive-btn');
            const safetyStatus = document.getElementById('safety-status');
            
            if (startBtn) {
                startBtn.textContent = 'STOP DRIVE';
                startBtn.classList.remove('disabled');
                startBtn.classList.add('active');
                startBtn.disabled = false;
            }
            
            if (safetyStatus) {
                safetyStatus.textContent = '🚗 Drive in Progress';
                safetyStatus.style.background = 'linear-gradient(90deg, #ff6b35, #ff8c42)';
                safetyStatus.style.cursor = 'default';
                safetyStatus.onclick = null;
            }
            
            driveInterval = setInterval(updateTimer, 1000);
            updateTimer();
            
            requestWakeLock();
            
            // Only show map if NOT in battery saver mode
            if (!isBatterySaver() && startLocation) {
                const mapPlaceholder = document.querySelector('.map-placeholder');
                if (mapPlaceholder) {
                    mapPlaceholder.innerHTML = '<div id="map-container" style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden;"></div>';
                    
                    setTimeout(() => {
                        if (window.initMap) {
                            window.initMap();
                        }
                        if (window.startRouteTracking) {
                            window.startRouteTracking(startLocation);
                        }
                    }, 100);
                }
            } else if (isBatterySaver()) {
                showBatterySaverPlaceholder();
            }
            
            console.log('Drive state restored');
            alert('Drive resumed!');
        } catch (error) {
            console.error('Error restoring drive state:', error);
            localStorage.removeItem('active_drive');
        }
    }
}

// Show battery saver placeholder
function showBatterySaverPlaceholder() {
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        let weatherInfo = '';
        if (driveWeather) {
            weatherInfo = `<p style="margin: 5px 0; font-size: 12px;">${driveWeather.temp}°F - ${driveWeather.condition}</p>`;
        }
        
        mapPlaceholder.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                <p style="font-size: 40px; margin: 0;">🔋</p>
                <p style="margin: 10px 0 5px; font-weight: bold; color: #00e676;">Battery Saver Active</p>
                <small>GPS recording in background</small>
                ${weatherInfo}
            </div>
        `;
    }
}

// Clear drive state
function clearDriveState() {
    localStorage.removeItem('active_drive');
    console.log('Drive state cleared');
}

// Load dashboard stats
window.loadDashboard = function() {
    const stats = window.getStats ? window.getStats() : {
        totalHours: 0,
        nightHours: 0,
        weeklyHours: 0
    };
    
    const reqs = window.getRequirements ? window.getRequirements() : { totalHours: 60, nightHours: 10, weeklyHours: 10 };
    updateStat('total', stats.totalHours, reqs.totalHours);
    updateStat('night', stats.nightHours, reqs.nightHours);
    updateStat('weekly', stats.weeklyHours, reqs.weeklyHours);
    
    restoreDriveState();
    
    console.log('Dashboard loaded:', stats);
};

function updateStat(type, current, max) {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const progressBar = document.getElementById(`${type}-progress`);
    const valueDisplay = document.getElementById(`${type}-hours`);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    
    if (valueDisplay) {
        valueDisplay.textContent = `${current.toFixed(1)}/${max}h`;
    }
}

// Start driving session
window.startDrive = function() {
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
        startBtn.disabled = true;
        startBtn.textContent = 'STOPPING...';
        startBtn.style.opacity = '0.6';
        stopDrive();
    } else {
        // Start the drive
        driveStartTime = new Date();
        driveWeather = null;
        
        requestWakeLock();
        
        const mapPlaceholder = document.querySelector('.map-placeholder');
        
        // Show loading state
        if (mapPlaceholder) {
            mapPlaceholder.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                    <p style="font-size: 24px; margin: 0;">⏳</p>
                    <small>Getting location & weather...</small>
                </div>
            `;
        }
        
        // Get GPS location
        if (navigator.geolocation) {
            const gpsOptions = isBatterySaver() 
                ? { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                : { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    startLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('Start location:', startLocation);
                    
                    // Fetch weather
                    driveWeather = await fetchWeather(startLocation.lat, startLocation.lng);
                    if (driveWeather) {
                        console.log('Weather:', driveWeather);
                    }
                    
                    saveDriveState();
                    
                    // Set up map or battery saver display
                    if (!isBatterySaver()) {
                        if (mapPlaceholder) {
                            mapPlaceholder.innerHTML = '<div id="map-container" style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden;"></div>';
                            
                            setTimeout(() => {
                                if (window.initMap) {
                                    window.initMap();
                                }
                                if (window.startRouteTracking) {
                                    window.startRouteTracking(startLocation);
                                }
                            }, 100);
                        }
                    } else {
                        showBatterySaverPlaceholder();
                        if (window.startRouteTrackingMinimal) {
                            window.startRouteTrackingMinimal(startLocation);
                        }
                    }
                },
                (error) => {
                    console.log('GPS error:', error);
                    startLocation = null;
                    saveDriveState();
                    
                    if (isBatterySaver()) {
                        showBatterySaverPlaceholder();
                    } else {
                        if (mapPlaceholder) {
                            mapPlaceholder.innerHTML = `
                                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                                    <p style="font-size: 24px; margin: 0;">📍</p>
                                    <small>GPS unavailable - time still tracking</small>
                                </div>
                            `;
                        }
                    }
                    
                    alert('⚠️ GPS not available. Drive will be recorded without location data.');
                },
                gpsOptions
            );
        } else {
            saveDriveState();
            if (isBatterySaver()) {
                showBatterySaverPlaceholder();
            }
        }
        
        if (startBtn) {
            startBtn.textContent = 'STOP DRIVE';
            startBtn.classList.add('active');
        }
        
        if (safetyStatus) {
            safetyStatus.textContent = '🚗 Drive in Progress';
            safetyStatus.style.background = 'linear-gradient(90deg, #ff6b35, #ff8c42)';
            safetyStatus.style.cursor = 'default';
            safetyStatus.onclick = null;
        }
        
        driveInterval = setInterval(updateTimer, 1000);
        
        console.log('Drive started at', driveStartTime, isBatterySaver() ? '(Battery Saver ON)' : '');
    }
};

function stopDrive() {
    if (!driveStartTime) return;
    
    const endTime = new Date();
    const durationMs = endTime - driveStartTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    const savedStartTime = driveStartTime;
    driveStartTime = null;
    
    const gpsOptions = isBatterySaver()
        ? { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
        : { timeout: 3000, maximumAge: 0, enableHighAccuracy: true };
    
    if (navigator.geolocation) {
        let locationReceived = false;
        
        const gpsTimeout = setTimeout(() => {
            if (!locationReceived) {
                console.log('GPS timeout - stopping without end location');
                
                if (window.stopRouteTracking) {
                    window.stopRouteTracking(null);
                }
                
                driveStartTime = savedStartTime;
                saveTrip(durationHours, null, null);
            }
        }, 5000);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationReceived = true;
                clearTimeout(gpsTimeout);
                
                const endLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                let routeData = null;
                if (window.stopRouteTracking) {
                    routeData = window.stopRouteTracking(endLocation);
                }
                
                driveStartTime = savedStartTime;
                saveTrip(durationHours, endLocation, routeData);
            },
            (error) => {
                locationReceived = true;
                clearTimeout(gpsTimeout);
                console.log('GPS error on stop:', error);
                
                if (window.stopRouteTracking) {
                    window.stopRouteTracking(null);
                }
                
                driveStartTime = savedStartTime;
                saveTrip(durationHours, null, null);
            },
            gpsOptions
        );
    } else {
        driveStartTime = savedStartTime;
        saveTrip(durationHours, null, null);
    }
}

function saveTrip(durationHours, endLocation, routeData) {
    // Calculate distance - use route if available, otherwise estimate from start/end
    let distance = null;
    
    if (routeData && routeData.distance) {
        distance = routeData.distance;
    } else if (startLocation && endLocation) {
        // Estimate distance from start to end (straight line)
        distance = getDistanceBetweenPoints(
            startLocation.lat, startLocation.lng,
            endLocation.lat, endLocation.lng
        );
    }
    
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
        distance: distance ? Number(distance.toFixed(2)) : null,
        weather: driveWeather,
        batterySaver: isBatterySaver()
    };
    
    if (routeData && routeData.points && routeData.points.length > 0) {
        let routePoints = routeData.points;
        if (routePoints.length > 20) {
            const step = Math.floor(routePoints.length / 18);
            const sampledPoints = [routePoints[0]];
            for (let i = step; i < routePoints.length - 1; i += step) {
                sampledPoints.push(routePoints[i]);
            }
            sampledPoints.push(routePoints[routePoints.length - 1]);
            routePoints = sampledPoints;
        }
        
        const cleanRoute = routePoints.map(point => [
            Number(point[0].toFixed(6)),
            Number(point[1].toFixed(6))
        ]);
        
        localStorage.setItem(`route_${trip.id}`, JSON.stringify(cleanRoute));
        console.log('Route stored with', cleanRoute.length, 'points');
    }
    
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
        startBtn.style.opacity = '1';
    }
    
    if (safetyStatus) {
        safetyStatus.textContent = 'Safety Check Required →';
        safetyStatus.style.background = 'linear-gradient(90deg, #ff6b35, #ff8c42)';
        safetyStatus.style.cursor = 'pointer';
        safetyStatus.onclick = window.navigateToChecklist;
    }
    
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
    
    if (driveInterval) {
        clearInterval(driveInterval);
        driveInterval = null;
    }
    
    clearDriveState();
    releaseWakeLock();
    
    localStorage.removeItem('safety_check_complete');
    
    driveStartTime = null;
    startLocation = null;
    driveWeather = null;
    
    if (window.clearMap) {
        window.clearMap();
    }
    
    // Reset map placeholder
    const mapContainer = document.getElementById('map-container');
    const batteryPlaceholder = document.querySelector('.map-placeholder, [style*="Battery Saver"]');
    
    if (mapContainer && mapContainer.parentElement) {
        mapContainer.parentElement.innerHTML = `
            <div class="map-placeholder">
                <p>🗺️</p>
                <small>GPS tracking active during drive</small>
            </div>
        `;
    } else if (batteryPlaceholder) {
        batteryPlaceholder.outerHTML = `
            <div class="map-placeholder">
                <p>🗺️</p>
                <small>GPS tracking active during drive</small>
            </div>
        `;
    }
    
    window.loadDashboard();
    
    // Build completion message
    let message = `Drive complete! Duration: ${durationHours.toFixed(2)} hours`;
    if (trip.distance) {
        message += ` (${trip.distance.toFixed(1)} miles)`;
    }
    if (trip.weather) {
        message += `\nWeather: ${trip.weather.temp}°F, ${trip.weather.condition}`;
    }
    
    alert(message);
    
    console.log('Attempting to sync trip to cloud...');
    if (window.pushToCloud) {
        setTimeout(() => {
            window.pushToCloud();
        }, 500);
    }
    
    console.log('Drive stopped, trip saved:', trip);
}

// Calculate distance between two points (Haversine formula)
function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
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
    
    // Save state less frequently in battery saver mode
    const saveInterval = isBatterySaver() ? 30 : 10;
    if (seconds % saveInterval === 0) {
        saveDriveState();
    }
}

// Load dashboard on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.loadDashboard);
} else {
    window.loadDashboard();
}

// Re-request wake lock when page visible (skip in battery saver)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && driveStartTime && !isBatterySaver()) {
        console.log('Page visible - re-requesting wake lock');
        requestWakeLock();
    }
});

console.log('Dashboard module loaded (with Battery Saver + Weather)');
