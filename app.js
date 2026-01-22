// LogLegends Unified Dashboard & GPS Engine
let map;
let driveInterval;
let startTime;

// Mock Storage for Verification
const Storage = {
    getStats: () => ({ totalHours: 12.5, goal: 60 }),
    getChecklistComplete: () => {
        const mirrors = document.getElementById('check-mirrors').checked;
        const belt = document.getElementById('check-belt').checked;
        return mirrors && belt;
    }
};

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

function updateProgress() {
    const stats = Storage.getStats();
    const percent = (stats.totalHours / stats.goal) * 100;
    document.getElementById('top-total-progress-bar').style.width = `${percent}%`;
    document.getElementById('total-hours-badge').textContent = `${stats.totalHours} / ${stats.goal}h`;
}

function toggleChecklist() {
    const btn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (Storage.getChecklistComplete()) {
        btn.disabled = false;
        btn.style.opacity = "1";
        warning.style.display = "none";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        warning.style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMaps();
    updateProgress();

    // Checklist Listeners
    document.getElementById('check-mirrors').addEventListener('change', toggleChecklist);
    document.getElementById('check-belt').addEventListener('change', toggleChecklist);

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.addEventListener('click', () => {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(updateTimer, 1000);
        } else {
            clearInterval(driveInterval);
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff";
            alert("Drive session saved to LogLegends history.");
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
