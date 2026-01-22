// Profile page functionality

// This file loads the timeline when the profile page is active
// Timeline rendering is handled by timeline.js

window.loadProfile = function() {
    if (window.loadTimeline) {
        window.loadTimeline();
    }
};

console.log('Profile module loaded');
