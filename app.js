import { initLogLegendsMap } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("LogLegends UI Ready");
    
    // Initialize Map
    initLogLegendsMap();

    // Start Drive Button Logic
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        alert("GPS Tracking and Timer Starting...");
        // Tracking logic will go here next
    });
});
