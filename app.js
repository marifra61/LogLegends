import Storage from './storage.js';

let map;
let driveInterval;
let startTime;

window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

function loadGoogleMaps() {
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
}

function toggleChecklist() {
    const m = document.getElementById('check-mirrors').checked;
    const b = document.getElementById('check-belt').checked;
    const p = document.getElementById('check-phone').checked;
    const btn = document.getElementById('start-drive-btn');
    
    if (m && b && p) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#00e5ff"; // Cyan when ready
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    loadGoogleMaps();

    // Attach listeners to the new Grid items
    ['check-mirrors', 'check-belt', 'check-phone'].forEach(id => {
        document.getElementById(id).addEventListener('change', toggleChecklist);
    });

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.addEventListener('click', () => {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(updateTimer, 1000);
        } else {
            const elapsedHours = (Date.now() - startTime) / (1000 * 60 * 60);
            Storage.saveDrive({
                duration: elapsedHours,
                isNight: new Date().getHours() >= 18 || new Date().getHours() < 6,
                timestamp: new Date().toISOString()
            });
            clearInterval(driveInterval);
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff";
            alert("Drive session saved!");
        }
    });
});

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${hrs}:${mins}:${secs}`;
}
