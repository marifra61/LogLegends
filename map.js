// Enhanced GPS tracking with Leaflet maps
let map = null;
let routePolyline = null;
let startMarker = null;
let endMarker = null;
let currentRoutePoints = [];
let trackingInterval = null;

// Initialize map
window.initMap = function() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    // Create map centered on user's location (or default)
    map = L.map('map-container').setView([35.7796, -78.6382], 13); // Default: Raleigh, NC
    
    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('Map initialized');
    
    // Try to center on user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            map.setView([userLat, userLng], 15);
        }, (error) => {
            console.log('Could not get user location:', error);
        });
    }
};

// Start tracking route
window.startRouteTracking = function(startLocation) {
    if (!map) {
        window.initMap();
    }
    
    currentRoutePoints = [];
    
    // Add start marker
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
    
    // Initialize polyline for route
    routePolyline = L.polyline(currentRoutePoints, {
        color: '#00e5ff',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
    
    // Track position every 5 minutes (balanced approach)
    trackingInterval = setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const speed = position.coords.speed; // meters per second
                
                // Add point to route with timestamp and speed
                currentRoutePoints.push([lat, lng]);
                routePolyline.setLatLngs(currentRoutePoints);
                
                // Center map on current position
                map.panTo([lat, lng]);
                
                console.log('Route point added:', lat, lng, 'Speed:', speed);
            }, (error) => {
                console.warn('GPS tracking error:', error);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }
    }, 300000); // Every 5 minutes (300,000 ms)
    
    console.log('Route tracking started');
};

// Stop tracking route
window.stopRouteTracking = function(endLocation) {
    // Stop interval
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    
    // Add end marker
    if (endLocation && map) {
        endMarker = L.marker([endLocation.lat, endLocation.lng], {
            icon: L.divIcon({
                className: 'end-marker',
                html: '<div style="background: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        currentRoutePoints.push([endLocation.lat, endLocation.lng]);
        if (routePolyline) {
            routePolyline.setLatLngs(currentRoutePoints);
        }
    }
    
    // Fit map to show entire route
    if (routePolyline && currentRoutePoints.length > 1) {
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    }
    
    console.log('Route tracking stopped. Total points:', currentRoutePoints.length);
    
    // Calculate distance
    const distance = calculateRouteDistance(currentRoutePoints);
    console.log('Total distance:', distance.toFixed(2), 'miles');
    
    // Return route data
    return {
        points: currentRoutePoints,
        distance: distance
    };
};

// Calculate total distance of route in miles
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

// Haversine formula to calculate distance between two GPS points (returns miles)
function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
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

// Display a past trip route on the map
window.displayTripRoute = function(trip) {
    if (!map) {
        window.initMap();
    }
    
    // Clear existing markers and polylines
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    if (routePolyline) map.removeLayer(routePolyline);
    
    // If trip has route data
    if (trip.route && trip.route.length > 0) {
        // Draw route
        routePolyline = L.polyline(trip.route, {
            color: trip.isNight ? '#667eea' : '#00e5ff',
            weight: 4,
            opacity: 0.8
        }).addTo(map);
        
        // Add start marker
        startMarker = L.marker(trip.route[0], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '<div style="background: #00e676; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        // Add end marker
        const lastPoint = trip.route[trip.route.length - 1];
        endMarker = L.marker(lastPoint, {
            icon: L.divIcon({
                className: 'end-marker',
                html: '<div style="background: #ff6b35; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        
        // Fit map to route
        map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });
    } else if (trip.startLocation && trip.endLocation) {
        // If only start/end points available
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
        
        // Draw straight line between start and end
        routePolyline = L.polyline([
            [trip.startLocation.lat, trip.startLocation.lng],
            [trip.endLocation.lat, trip.endLocation.lng]
        ], {
            color: '#999',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 10'
        }).addTo(map);
        
        // Fit map to markers
        const bounds = L.latLngBounds([
            [trip.startLocation.lat, trip.startLocation.lng],
            [trip.endLocation.lat, trip.endLocation.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
};

// Clear map
window.clearMap = function() {
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
    currentRoutePoints = [];
};

console.log('Enhanced map.js loaded');
