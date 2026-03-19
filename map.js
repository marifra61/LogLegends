// Enhanced GPS tracking with Battery Saver Mode
let map = null;
let routePolyline = null;
let startMarker = null;
let endMarker = null;
let currentRoutePoints = [];
let trackingInterval = null;

// Check if battery saver is enabled
function isBatterySaver() {
    return localStorage.getItem('battery_saver') === 'true';
}

// Initialize map (skipped in battery saver mode during drive)
window.initMap = function() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    map = L.map('map-container').setView([35.7796, -78.6382], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('Map initialized');
    
    if (navigator.geolocation) {
        const gpsOptions = isBatterySaver()
            ? { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            : { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            map.setView([userLat, userLng], 15);
        }, (error) => {
            console.log('Could not get user location:', error);
        }, gpsOptions);
    }
};

// Start route tracking (full mode with live map)
window.startRouteTracking = function(startLocation) {
    if (!map) {
        window.initMap();
    }
    
    currentRoutePoints = [];
    
    if (startLocation) {
        startMarker = L.marker([startLocation.lat, startLocation.lng], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '<div style="background: #00e676; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        currentRoutePoints.push([startLocation.lat, startLocation.lng]);
        map.setView([startLocation.lat, startLocation.lng], 16);
    }
    
    routePolyline = L.polyline(currentRoutePoints, {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
    
    // Track every 5 minutes in normal mode
    trackingInterval = setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                currentRoutePoints.push([lat, lng]);
                routePolyline.setLatLngs(currentRoutePoints);
                map.panTo([lat, lng]);
                
                console.log('Route point added:', lat, lng);
            }, (error) => {
                console.warn('GPS tracking error:', error);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }
    }, 300000); // 5 minutes
    
    console.log('Route tracking started (full mode)');
};

// Minimal tracking for battery saver mode (no live map, less frequent updates)
window.startRouteTrackingMinimal = function(startLocation) {
    currentRoutePoints = [];
    
    if (startLocation) {
        currentRoutePoints.push([startLocation.lat, startLocation.lng]);
    }
    
    // Track every 10 minutes in battery saver mode with low accuracy
    trackingInterval = setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                currentRoutePoints.push([lat, lng]);
                console.log('Route point added (minimal):', lat, lng);
            }, (error) => {
                console.warn('GPS tracking error:', error);
            }, {
                enableHighAccuracy: false,  // Low accuracy = less battery
                timeout: 15000,
                maximumAge: 120000  // Accept 2-minute-old readings
            });
        }
    }, 600000); // 10 minutes instead of 5
    
    console.log('Route tracking started (battery saver mode)');
};

// Stop tracking route
window.stopRouteTracking = function(endLocation) {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    
    if (endLocation) {
        currentRoutePoints.push([endLocation.lat, endLocation.lng]);
        
        // Only add marker if map exists (not in battery saver mode)
        if (map && endMarker === null) {
            endMarker = L.marker([endLocation.lat, endLocation.lng], {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '<div style="background: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(map);
        }
        
        if (routePolyline) {
            routePolyline.setLatLngs(currentRoutePoints);
        }
    }
    
    if (routePolyline && currentRoutePoints.length > 1 && map) {
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    }
    
    console.log('Route tracking stopped. Total points:', currentRoutePoints.length);
    
    const distance = calculateRouteDistance(currentRoutePoints);
    console.log('Total distance:', distance.toFixed(2), 'miles');
    
    return {
        points: currentRoutePoints,
        distance: distance
    };
};

// Calculate distance
function calculateRouteDistance(points) {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
        const lat1 = points[i][0];
        const lon1 = points[i][1];
        const lat2 = points[i + 1][0];
        const lon2 = points[i + 1][1];
        
        totalDistance += getDistanceBetweenPoints(lat1, lon1, lat2, lon2);
    }
    
    return totalDistance;
}

function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 3959;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Display a past trip route
window.displayTripRoute = function(trip) {
    if (!map) {
        window.initMap();
    }
    
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    if (routePolyline) map.removeLayer(routePolyline);
    
    if (trip.route && trip.route.length > 0) {
        routePolyline = L.polyline(trip.route, {
            color: trip.isNight ? '#667eea' : '#00e5ff',
            weight: 4,
            opacity: 0.8
        }).addTo(map);
        
        startMarker = L.marker(trip.route[0], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '<div style="background: #00e676; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        const lastPoint = trip.route[trip.route.length - 1];
        endMarker = L.marker(lastPoint, {
            icon: L.divIcon({
                className: 'end-marker',
                html: '<div style="background: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    } else if (trip.startLocation && trip.endLocation) {
        startMarker = L.marker([trip.startLocation.lat, trip.startLocation.lng], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '<div style="background: #00e676; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        endMarker = L.marker([trip.endLocation.lat, trip.endLocation.lng], {
            icon: L.divIcon({
                className: 'end-marker',
                html: '<div style="background: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        routePolyline = L.polyline([
            [trip.startLocation.lat, trip.startLocation.lng],
            [trip.endLocation.lat, trip.endLocation.lng]
        ], {
            color: '#999',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 10'
        }).addTo(map);
        
        const bounds = L.latLngBounds([
            [trip.startLocation.lat, trip.startLocation.lng],
            [trip.endLocation.lat, trip.endLocation.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
};

// Clear map
window.clearMap = function() {
    if (map) {
        if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
        }
        if (endMarker) {
            map.removeLayer(endMarker);
            endMarker = null;
        }
        if (routePolyline) {
            map.removeLayer(routePolyline);
            routePolyline = null;
        }
    }
    currentRoutePoints = [];
};

console.log('Map module loaded (with Battery Saver support)');
