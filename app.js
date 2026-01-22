let map;
let timerInterval;
let seconds = 0;

// 1. Initialize Map Logic
window.initMap = function() {
    console.log("Map script loaded.");
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }
        ]
    });
};

// 2. Load Google Maps Script
function loadGoogleMaps() {
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
}

// 3. Timer Logic
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(() => {
        seconds++;
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// 4. Start Button Event
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMaps();

    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444"; // Red for stop
            startTimer();
            console.log("Drive Session Started");
        } else {
            clearInterval(timerInterval);
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff"; // Cyan for start
            alert("Drive Session Logged!");
        }
    });
});
