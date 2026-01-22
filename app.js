// LogLegends Global Engine
let map;
let driveInterval;
let startTime;

// 1. Storage Logic (Embedded)
const Storage = {
    init() {
        if (!localStorage.getItem('loglegends_data')) {
            localStorage.setItem('loglegends_data', JSON.stringify({
                profile: { totalHours: 0, goal: 60, nightHours: 0, nightGoal: 10 },
                drives: []
            }));
        }
    },
    saveDrive(hours) {
        const data = JSON.parse(localStorage.getItem('loglegends_data'));
        data.profile.totalHours += hours;
        localStorage.setItem('loglegends_data', JSON.stringify(data));
    }
};

// 2. Map Initialization
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

// 3. Logic to unlock the button
function toggleChecklist() {
    const m = document.getElementById('check-mirrors').checked;
    const b = document.getElementById('check-belt').checked;
    const p = document.getElementById('check-phone').checked;
    const btn = document.getElementById('start-drive-btn');
    
    if (m && b && p) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#00e5ff"; 
        console.log("Checklist complete. Button unlocked.");
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.backgroundColor = "#333";
    }
}

// 4. App Start
document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    
    // Load Google Maps
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);

    // Link Checkboxes
    document.getElementById('check-mirrors').onchange = toggleChecklist;
    document.getElementById('check-belt').onchange = toggleChecklist;
    document.getElementById('check-phone').onchange = toggleChecklist;

    // Button Click Handler
    const startBtn = document.getElementById('start-drive-btn');
    startBtn.onclick = function() {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
                const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
                const secs = String(elapsed % 60).padStart(2, '0');
                document.getElementById('timer').textContent = `${hrs}:${mins}:${secs}`;
            }, 1000);
        } else {
            clearInterval(driveInterval);
            const finalHours = (Date.now() - startTime) / 3600000;
            Storage.saveDrive(finalHours);
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff";
            alert("Drive session saved!");
        }
    };
});
