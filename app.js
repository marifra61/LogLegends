// LogLegends Integrated Engine
let map;
let startTime;
let driveInterval;
let isChecklistComplete = false; // Global state for the drive lock

const ChecklistData = [
    { id: 'mirrors', label: 'Mirrors Adjusted', icon: '' },
    { id: 'seatbelt', label: 'Seatbelt Fastened', icon: '' },
    { id: 'phone', label: 'Phone Mounted', icon: '' },
    { id: 'lights', label: 'Lights Checked', icon: '' }
];

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Refresh button state whenever we return to dashboard
    if (pageId === 'dashboard') updateStartButton();
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

function updateStartButton() {
    const startBtn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (isChecklistComplete) {
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
        btn.addEventListener('click', () => showPage(btn.dataset.page));
    });

    // Unified Verify Function (From checklist.js completeChecklist)
    document.getElementById('complete-checklist-btn').addEventListener('click', () => {
        const checks = document.querySelectorAll('.vibe-check');
        const allChecked = Array.from(checks).every(c => c.checked);
        
        if (allChecked) {
            isChecklistComplete = true; // Unlock the drive
            alert(" Safety Checks Complete!");
            showPage('dashboard');
        } else {
            alert(" Please complete ALL safety checks first!");
        }
    });

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.addEventListener('click', () => {
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
            startBtn.textContent = "START DRIVE";
            startBtn.style.backgroundColor = "#00e5ff";
            isChecklistComplete = false; // Relock after drive
            alert("Drive session logged!");
            updateStartButton();
        }
    });

    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});
