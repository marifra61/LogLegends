// Storage utility functions for LogLegends

// Initialize default stats if none exist
function initializeStats() {
    const stats = getStats();
    if (!stats.totalHours) {
        saveStats({
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: [],
            weekStartDate: new Date().toISOString()
        });
    }
}

// Get driving stats from localStorage
function getStats() {
    const statsStr = localStorage.getItem('driving_stats');
    if (!statsStr) {
        return {
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: [],
            weekStartDate: new Date().toISOString()
        };
    }
    try {
        return JSON.parse(statsStr);
    } catch (e) {
        console.error('Error parsing stats:', e);
        return {
            totalHours: 0,
            nightHours: 0,
            weeklyHours: 0,
            trips: [],
            weekStartDate: new Date().toISOString()
        };
    }
}

// Save driving stats to localStorage
function saveStats(stats) {
    try {
        localStorage.setItem('driving_stats', JSON.stringify(stats));
        console.log('Stats saved:', stats);
        return true;
    } catch (e) {
        console.error('Error saving stats:', e);
        return false;
    }
}

// Add a new trip
function addTrip(trip) {
    const stats = getStats();
    stats.trips.push(trip);
    stats.totalHours += trip.duration;
    
    if (trip.isNight) {
        stats.nightHours += trip.duration;
    }
    
    // Check if we need to reset weekly hours
    const weekStart = new Date(stats.weekStartDate);
    const now = new Date();
    const daysDiff = (now - weekStart) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
        stats.weeklyHours = trip.duration;
        stats.weekStartDate = now.toISOString();
    } else {
        stats.weeklyHours += trip.duration;
    }
    
    saveStats(stats);
    return stats;
}

// Check if it's night time (6pm - 6am)
function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
}

// Format hours to readable string
function formatHours(hours) {
    return hours.toFixed(1) + 'h';
}

// Make functions available globally
window.getStats = getStats;
window.saveStats = saveStats;
window.addTrip = addTrip;
window.isNightTime = isNightTime;
window.formatHours = formatHours;

// Initialize on load
initializeStats();
console.log('Storage initialized');
