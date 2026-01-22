let map;
let driveInterval;
let startTime;
let isUnlocked = false; 

// Initial Stats for Compliance Engine
let stats = { total: 12.5, night: 2.0, weekly: 4.2 }; 

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
    if(pageId === 'checklist') document.getElementById('nav-check').classList.add('active');
    if(pageId === 'timeline') {
        document.getElementById('nav-time').classList.add('active');
        renderTimeline();
    }
};

// Compliance UI Updates
function updateComplianceUI() {
    const totalProgress = (stats.total / 60) * 100;
    document.getElementById('top-total-progress-bar').style.width = `${totalProgress}%`;
    document.getElementById('total-hours-badge').textContent = `${stats.total.toFixed(1)} / 60h Total`;
    document.getElementById('top-night-hours-display').textContent = `${stats.night.toFixed(1)}/10h`;
    document.getElementById('top-weekly-display').textContent = `${stats.weekly.toFixed(1)}/10h WK`;
}

// Timeline Rendering
function renderTimeline() {
    const list = document.getElementById('timeline-list');
    list.innerHTML = `
        <div class="timeline-item"><span> Day Drive</span> <b>1.2 hrs</b></div>
        <div class="timeline-item"><span> Night Drive</span> <b>0.8 hrs</b></div>
    `;
}

function refreshDriveButton() {
    const btn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (isUnlocked) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#00e5ff";
        warning.style.display = "none";
    }
}

window.closePremium = () => document.getElementById('premium-modal').classList.remove('active');

document.addEventListener('DOMContentLoaded', () => {
    updateComplianceUI();
    
    document.getElementById('checklist-items').innerHTML = ChecklistItems.map(item => `
        <div class="checklist-card">
            <input type="checkbox" class="vibe-check" id="c-${item.id}">
            <label for="c-${item.id}">${item.icon} ${item.label}</label>
        </div>
    `).join('');

    document.getElementById('complete-checklist-btn').onclick = function() {
        if (document.querySelectorAll('.vibe-check:checked').length === 8) {
            isUnlocked = true;
            window.showPage('dashboard');
        } else {
            alert("Please complete all 8 safety checks.");
        }
    };

    // Freemium Export Trigger
    document.getElementById('export-pdf-btn').onclick = () => {
        document.getElementById('premium-modal').classList.add('active');
    };

    const startBtn = document.getElementById('start-drive-btn');
    startBtn.onclick = function() {
        if (this.textContent === "START DRIVE") {
            this.textContent = "STOP DRIVE";
            this.style.backgroundColor = "#ff4444";
            startTime = Date.now();
            driveInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                document.getElementById('timer').textContent = new Date(elapsed * 1000).toISOString().substr(11, 8);
            }, 1000);
        } else {
            clearInterval(driveInterval);
            const hoursEarned = (Date.now() - startTime) / 3600000;
            stats.total += hoursEarned; // Update Compliance Engine
            isUnlocked = false;
            this.textContent = "START DRIVE";
            updateComplianceUI();
            refreshDriveButton();
            alert("Drive Session Logged!");
        }
    };

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
