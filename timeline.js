// Timeline functionality for displaying trip history

window.loadTimeline = function() {
    const stats = window.getStats ? window.getStats() : { trips: [] };
    const container = document.getElementById('timeline-container');
    
    if (!container) return;
    
    if (!stats.trips || stats.trips.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 3rem; margin-bottom: 10px;">🚗</p>
                <p>No drives recorded yet</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Complete your first drive to see it here!</p>
            </div>
        `;
        return;
    }
    
    // Sort trips by most recent first
    const sortedTrips = [...stats.trips].sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
    );
    
    container.innerHTML = '';
    
    sortedTrips.forEach(trip => {
        const tripDiv = document.createElement('div');
        tripDiv.className = 'timeline-item';
        
        const startDate = new Date(trip.startTime);
        const endDate = new Date(trip.endTime);
        
        const dateStr = startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const startTimeStr = startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        const endTimeStr = endDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        const durationStr = trip.duration.toFixed(2) + ' hours';
        const nightBadge = trip.isNight ? '<span class="night-badge">🌙 Night</span>' : '';
        
        tripDiv.innerHTML = `
            <div class="trip-header">
                <strong>${dateStr}</strong>
                ${nightBadge}
            </div>
            <div class="trip-details">
                <p>⏰ ${startTimeStr} → ${endTimeStr}</p>
                <p>⏱️ Duration: ${durationStr}</p>
            </div>
        `;
        
        container.appendChild(tripDiv);
    });
    
    console.log('Timeline loaded with', sortedTrips.length, 'trips');
};

// Load timeline when navigating to profile page
document.addEventListener('DOMContentLoaded', () => {
    // Listen for page changes
    const observer = new MutationObserver(() => {
        const profilePage = document.getElementById('page-profile');
        if (profilePage && profilePage.classList.contains('active')) {
            window.loadTimeline();
        }
    });
    
    // Observe changes to page classes
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true, attributeFilter: ['class'] });
    });
});

console.log('Timeline module loaded');
