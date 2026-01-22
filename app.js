let map;
let driveInterval;
let startTime;
let isUnlocked = false; // The Master Key

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
    // Toggle Sections
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    // Update Nav Icons
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(pageId === 'dashboard') document.getElementById('nav-dash').classList.add('active');
    if(pageId === 'checklist') document.getElementById('nav-check').classList.add('active');

    // Sync button state on every page swap
    refreshDriveButton();
};

function refreshDriveButton() {
    const btn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (isUnlocked) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#00e5ff";
        warning.style.display = "none";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        warning.style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Render Checklist
    const listContainer = document.getElementById('checklist-items');
    listContainer.innerHTML = ChecklistItems.map(item => `
        <div class="checklist-card">
            <input type="checkbox" class="vibe-check" id="c-${item.id}">
            <label for="c-${item.id}">${item.icon} ${item.label}</label>
        </div>
    `).join('');

    // Verify Button Logic
    document.getElementById('complete-checklist-btn').onclick = () => {
        const total = document.querySelectorAll('.vibe-check').length;
        const checked = document.querySelectorAll('.vibe-check:checked').length;
        
        if (checked === total) {
            isUnlocked = true;
            alert(" Safety Protocol Cleared!");
            window.showPage('dashboard');
        } else {
            alert(` Please check all 8 items. (${checked}/${total} done)`);
        }
    };

    // Start/Stop Logic
    const startBtn = document.getElementById('start-drive-btn');
    startBtn.onclick = () => {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(updateTimer, 1000);
        } else {
            clearInterval(driveInterval);
            isUnlocked = false; // Relock for safety
            startBtn.textContent = "START DRIVE";
            refreshDriveButton();
            alert("Drive session logged!");
        }
    };

    // Google Maps Loader
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk";
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});

window.initMap = () => {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, zoom: 15, disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${hrs}:${mins}:${secs}`;
}
