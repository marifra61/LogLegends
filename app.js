setTimeout(() => { 
let map;
let driveInterval;
let startTime;
let isUnlocked = false;
let drivePath = []; // To store GPS coordinates
let polyline;

// RESET DATA: Starting fresh at 0.0
let stats = { total: 0.0, night: 0.0, weekly: 0.0 }; 

const ChecklistItems = [
    { id: 'mirrors', label: 'Adjust all mirrors', icon: '' },
    { id: 'seatbelt', label: 'Fasten seatbelt', icon: '' },
    { id: 'seat', label: 'Adjust seat position', icon: '' },
    { id: 'lights', label: 'Check headlights/signals', icon: '' },
    { id: 'brakes', label: 'Test brakes', icon: '' },
    { id: 'fuel', label: 'Check fuel level', icon: '' },
    { id: 'tires', label: 'Inspect tire pressure', icon: '' },
    { id: 'surroundings', label: 'Check surroundings', icon: '' }
];

window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(pageId === 'dashboard') {
        document.getElementById('nav-dash').classList.add('active');
        refreshDriveButton();
    }
};

function updateComplianceUI() {
    document.getElementById('bar-total').style.width = `${Math.min((stats.total / 60) * 100, 100)}%`;
    document.getElementById('bar-night').style.width = `${Math.min((stats.night / 10) * 100, 100)}%`;
    document.getElementById('bar-weekly').style.width = `${Math.min((stats.weekly / 10) * 100, 100)}%`;
    document.getElementById('txt-total').textContent = `${stats.total.toFixed(1)}h`;
    document.getElementById('txt-night').textContent = `${stats.night.toFixed(1)}h`;
    document.getElementById('txt-weekly').textContent = `${stats.weekly.toFixed(1)}h`;
}

// GPS Tracking Logic
function startGpsTracking() {
    drivePath = [];
    if (polyline) polyline.setMap(null); // Clear old paths
    
    polyline = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#00e5ff",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map
    });

    navigator.geolocation.watchPosition((position) => {
        const newPoint = { lat: position.coords.latitude, lng: position.coords.longitude };
        drivePath.push(newPoint);
        polyline.setPath(drivePath);
        map.panTo(newPoint); // Keep map centered on you
    }, (err) => console.error("GPS Error", err), { enableHighAccuracy: true });
}

document.addEventListener('DOMContentLoaded', () => {
    updateComplianceUI();
    document.getElementById('checklist-items').innerHTML = ChecklistItems.map(item => `
        <div class="checklist-card"><input type="checkbox" class="vibe-check" id="c-${item.id}"><label for="c-${item.id}">${item.icon} ${item.label}</label></div>
    `).join('');

    document.getElementById('complete-checklist-btn').onclick = () => {
        if (document.querySelectorAll('.vibe-check:checked').length === 8) {
            isUnlocked = true;
            window.showPage('dashboard');
        } else { alert("Complete all 8 items."); }
    };

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.onclick = function() {
        if (this.textContent === "START DRIVE") {
            this.textContent = "STOP DRIVE";
            this.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            startGpsTracking(); // Start drawing path
            driveInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                document.getElementById('timer').textContent = new Date(elapsed * 1000).toISOString().substr(11, 8);
            }, 1000);
        } else {
            clearInterval(driveInterval);
            const hoursEarned = (Date.now() - startTime) / 3600000;
            stats.total += hoursEarned;
            stats.weekly += hoursEarned;
            if (new Date().getHours() >= 18 || new Date().getHours() < 6) stats.night += hoursEarned;
            
            isUnlocked = false;
            this.textContent = "START DRIVE";
            updateComplianceUI();
            refreshDriveButton();
        }
    };

    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk";
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});

function refreshDriveButton() {
    const btn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (isUnlocked) {
        btn.disabled = false; btn.style.opacity = "1"; btn.style.backgroundColor = "#00e5ff"; warning.style.display = "none";
    }
}

window.initMap = () => {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, zoom: 17, disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

 }, 500);
