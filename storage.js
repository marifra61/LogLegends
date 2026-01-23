// Storage functions for driving statistics

// Get current stats from localStorage
window.getStats = function() {
    const statsStr = localStorage.getItem('driving_stats');
    if (statsStr) {
        try {
            return JSON.parse(statsStr);
        } catch (e) {
            console.error('Error parsing stats:', e);
        }
    }
    
    // Return default stats
    return {
        totalHours: 0,
        nightHours: 0,
        weeklyHours: 0,
        trips: []
    };
};

// Save stats to localStorage
function saveStats(stats) {
    localStorage.setItem('driving_stats', JSON.stringify(stats));
    console.log('Stats saved:', stats);
}

// Add a new trip
window.addTrip = function(trip) {
    const stats = window.getStats();
    
    // Add to total hours
    stats.totalHours += trip.duration;
    
    // Add to night hours if night drive
    if (trip.isNight) {
        stats.nightHours += trip.duration;
    }
    
    // Calculate weekly hours (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    stats.weeklyHours = stats.trips
        .filter(t => new Date(t.startTime) > oneWeekAgo)
        .reduce((sum, t) => sum + t.duration, 0) + trip.duration;
    
    // Add trip to list
    stats.trips.push(trip);
    
    // Save to storage
    saveStats(stats);
    
    console.log('Trip added:', trip);
};

// Check if current time is night (6pm - 6am)
window.isNightTime = function() {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
};

// Get trips sorted by date (newest first)
window.getTrips = function() {
    const stats = window.getStats();
    return stats.trips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
};

// Calculate average speed for a trip (in mph)
window.calculateAverageSpeed = function(distance, durationHours) {
    if (!distance || !durationHours || durationHours === 0) {
        return 0;
    }
    return distance / durationHours;
};

// Format distance for display
window.formatDistance = function(miles) {
    if (!miles) return 'N/A';
    if (miles < 0.1) return (miles * 5280).toFixed(0) + ' ft';
    return miles.toFixed(1) + ' mi';
};

// Format speed for display
window.formatSpeed = function(mph) {
    if (!mph || mph === 0) return 'N/A';
    return mph.toFixed(0) + ' mph';
};

// Get weekly summary
window.getWeeklySummary = function() {
    const stats = window.getStats();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTrips = stats.trips.filter(t => new Date(t.startTime) > oneWeekAgo);
    
    return {
        trips: weeklyTrips.length,
        hours: weeklyTrips.reduce((sum, t) => sum + t.duration, 0),
        distance: weeklyTrips.reduce((sum, t) => sum + (t.distance || 0), 0),
        nightTrips: weeklyTrips.filter(t => t.isNight).length
    };
};

// Export all data for PDF
window.exportAllData = function() {
    const stats = window.getStats();
    const user = {
        name: localStorage.getItem('log_name'),
        email: localStorage.getItem('log_email')
    };
    
    return {
        user: user,
        stats: stats,
        exportDate: new Date().toISOString()
    };
};

// Clear all data (for testing)
window.clearAllData = function() {
    if (confirm('Are you sure you want to clear all driving data? This cannot be undone.')) {
        localStorage.removeItem('driving_stats');
        localStorage.removeItem('safety_check_complete');
        console.log('All data cleared');
        if (window.loadDashboard) {
            window.loadDashboard();
        }
        alert('All data cleared!');
    }
};

console.log('Storage module loaded');
