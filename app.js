let map;
let startTime;
let driveInterval;

const LogLegendsState = {
    isUnlocked: false
};

// Original AntiGravity Checklist Data
const ChecklistData = [
    { id: 'mirrors', label: 'Adjust all mirrors', icon: '' },
    { id: 'seatbelt', label: 'Fasten seatbelt', icon: '' },
    { id: 'seat', label: 'Adjust seat position', icon: '' },
    { id: 'lights', label: 'Check headlights/signals', icon: '' },
    { id: 'brakes', label: 'Test brakes', icon: '' },
    { id: 'fuel', label: 'Check fuel level', icon: '' },
    { id: 'tires', label: 'Inspect tire pressure', icon: '' },
    { id: 'surroundings', label: 'Check surroundings', icon: '' }
];

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    if (pageId === 'dashboard') refreshDashboardUI();
}

function refreshDashboardUI() {
    const startBtn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (LogLegendsState.isUnlocked) {
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
        startBtn.style.backgroundColor = "#00e5ff";
        warning.style.display = "none";
    } else {
        startBtn.disabled = true;
        startBtn.style.opacity = "0.5";
        warning.style.display = "block";
    }
}

function verifySafetyChecklist() {
    const checks = document.querySelectorAll('.vibe-check');
    const allDone = Array.from(checks).every(c => c.checked);
    if (allDone) {
        LogLegendsState.isUnlocked = true;
        showPage('dashboard');
    } else {
        alert(' Please complete all safety checks before proceeding!');
    }
}

function renderChecklist() {
    const container = document.getElementById('checklist-items');
    container.innerHTML = ChecklistData.map(item => `
        <div class="checklist-card">
            <input type="checkbox" id="check-${item.id}" class="vibe-check">
            <label for="check-${item.id}">${item.icon} ${item.label}</label>
        </div>
    `).join('');
}

window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

document.addEventListener('DOMContentLoaded', () => {
    renderChecklist();
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => showPage(btn.dataset.page);
    });
    document.getElementById('complete-checklist-btn').onclick = verifySafetyChecklist;

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
            LogLegendsState.isUnlocked = false;
            startBtn.textContent = "START DRIVE";
            refreshDashboardUI();
            alert("Drive session logged!");
        }
    };

    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});
