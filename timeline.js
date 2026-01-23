// Timeline functionality with route loading from localStorage

window.loadTimeline = function() {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    
    const trips = window.getTrips ? window.getTrips() : [];
    
    if (trips.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 3rem; margin-bottom: 10px;">📋</p>
                <p>No trips recorded yet.</p>
                <p style="margin-top: 10px;">Complete your first drive to see it here!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    trips.forEach((trip, index) => {
        const item = createTimelineItem(trip, index);
        container.appendChild(item);
    });
    
    console.log('Timeline loaded with', trips.length, 'trips');
};

function createTimelineItem(trip, index) {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    
    const startDate = new Date(trip.startTime);
    const endDate = new Date(trip.endTime);
    
    const dateStr = startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    const startTimeStr = startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
    });
    
    const endTimeStr = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit'
    });
    
    const durationStr = trip.duration.toFixed(2) + ' hours';
    
    // Calculate average speed if we have distance
    let speedInfo = '';
    if (trip.distance && trip.duration > 0) {
        const avgSpeed = window.calculateAverageSpeed ? 
            window.calculateAverageSpeed(trip.distance, trip.duration) : 
            trip.distance / trip.duration;
        
        speedInfo = `
            <p>📏 Distance: <strong>${window.formatDistance ? window.formatDistance(trip.distance) : trip.distance.toFixed(1) + ' mi'}</strong></p>
            <p>⚡ Avg Speed: <strong>${window.formatSpeed ? window.formatSpeed(avgSpeed) : avgSpeed.toFixed(0) + ' mph'}</strong></p>
        `;
    }
    
    // Check if route data exists in localStorage
    const routeKey = `route_${trip.id}`;
    const hasRoute = localStorage.getItem(routeKey) !== null;
    
    // Route info
    let routeInfo = '';
    if (hasRoute) {
        const route = JSON.parse(localStorage.getItem(routeKey));
        routeInfo = `
            <p>🗺️ Route Points: <strong>${route.length}</strong></p>
            <button onclick="viewTripRoute(${trip.id})" class="view-route-btn" style="
                background: rgba(0, 229, 255, 0.2);
                color: #00e5ff;
                border: 1px solid #00e5ff;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
                margin-top: 10px;
                width: 100%;
            ">View Route on Map</button>
        `;
    } else if (trip.startLocation && trip.endLocation) {
        routeInfo = `
            <p>📍 Start/End locations tracked</p>
            <button onclick="viewTripRoute(${trip.id})" class="view-route-btn" style="
                background: rgba(0, 229, 255, 0.2);
                color: #00e5ff;
                border: 1px solid #00e5ff;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
                margin-top: 10px;
                width: 100%;
            ">View Locations</button>
        `;
    }
    
    div.innerHTML = `
        <div class="trip-header">
            <span>${dateStr}</span>
            ${trip.isNight ? '<span class="night-badge">🌙 Night</span>' : ''}
        </div>
        <div class="trip-details">
            <p>🕐 ${startTimeStr} - ${endTimeStr}</p>
            <p>⏱️ Duration: <strong>${durationStr}</strong></p>
            ${speedInfo}
            ${routeInfo}
        </div>
    `;
    
    return div;
}

// View a trip's route on the map
window.viewTripRoute = function(tripId) {
    // Find trip by ID
    const trips = window.getTrips ? window.getTrips() : [];
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
        alert('Trip not found!');
        return;
    }
    
    // Load route from localStorage if it exists
    const routeKey = `route_${tripId}`;
    const routeData = localStorage.getItem(routeKey);
    
    if (routeData) {
        trip.route = JSON.parse(routeData);
        console.log('Route loaded from localStorage:', trip.route.length, 'points');
    }
    
    // Switch to dashboard to show map
    if (window.showPage) {
        window.showPage('dashboard');
    }
    
    // Replace map placeholder with actual map
    setTimeout(() => {
        const mapPlaceholder = document.querySelector('.map-placeholder');
        const mapContainer = document.getElementById('map-container');
        
        if (mapPlaceholder && !mapContainer) {
            mapPlaceholder.innerHTML = '<div id="map-container" style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden;"></div>';
            
            // Initialize map and display route
            setTimeout(() => {
                if (window.displayTripRoute) {
                    window.displayTripRoute(trip);
                }
            }, 200);
        } else if (mapContainer) {
            // Map already exists, just display route
            if (window.displayTripRoute) {
                window.displayTripRoute(trip);
            }
        }
        
        // Show trip info banner
        const safetyStatus = document.getElementById('safety-status');
        if (safetyStatus) {
            const dateStr = new Date(trip.startTime).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
            safetyStatus.textContent = `📍 Viewing trip from ${dateStr}`;
            safetyStatus.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
        }
    }, 100);
};

// Load timeline when page loads or is shown
const originalShowPage = window.showPage;
window.showPage = function(pageId) {
    if (originalShowPage) {
        originalShowPage(pageId);
    }
    
    if (pageId === 'profile') {
        setTimeout(() => {
            if (window.loadTimeline) {
                window.loadTimeline();
            }
        }, 100);
    }
};

// Initial load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id === 'page-profile') {
            window.loadTimeline();
        }
    });
} else {
    const currentPage = document.querySelector('.page.active');
    if (currentPage && currentPage.id === 'page-profile') {
        window.loadTimeline();
    }
}

console.log('Enhanced timeline with localStorage route loading');
