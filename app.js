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

function updateUIFromStorage() {
    const data = Storage.getData();
    const percent = (data.profile.totalHours / data.profile.goal) * 100;
    document.getElementById('top-total-progress-bar').style.width = `${percent}%`;
    document.getElementById('total-hours-badge').textContent = `${data.profile.totalHours.toFixed(1)} / ${data.profile.goal}h`;
    document.getElementById('top-night-hours-display').textContent = `${data.profile.nightHours.toFixed(1)}/${data.profile.nightGoal}h`;
}

document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    loadGoogleMaps();
    updateUIFromStorage();

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.addEventListener('click', () => {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(updateTimer, 1000);
        } else {
            const elapsedHours = (Date.now() - startTime) / (1000 * 60 * 60);
            
            // Save the drive
            Storage.saveDrive({
                duration: elapsedHours,
                isNight: new Date().getHours() >= 18 || new Date().getHours() < 6,
                timestamp: new Date().toISOString()
            });

            clearInterval(driveInterval);
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff";
            updateUIFromStorage();
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
