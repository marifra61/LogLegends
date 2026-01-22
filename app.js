let map;
let driveInterval;
let startTime;
let isUnlocked = false; 

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
    if(pageId === 'dashboard') refreshDriveButton();
};

function refreshDriveButton() {
    const btn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    if (isUnlocked) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.backgroundColor = "#00e5ff";
        btn.style.pointerEvents = "auto";
        warning.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Render Checklist
    document.getElementById('checklist-items').innerHTML = ChecklistItems.map(item => `
        <div class="checklist-card">
            <input type="checkbox" class="vibe-check" id="c-${item.id}">
            <label for="c-${item.id}">${item.icon} ${item.label}</label>
        </div>
    `).join('');

    // Verification Logic
    document.getElementById('complete-checklist-btn').onclick = function() {
        const checked = document.querySelectorAll('.vibe-check:checked').length;
        if (checked === 8) {
            isUnlocked = true;
            window.showPage('dashboard');
        } else {
            alert(`Please check all items (${checked}/8)`);
        }
    };

    // Drive Logic
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
            isUnlocked = false;
            this.textContent = "START DRIVE";
            refreshDriveButton();
            alert("Drive session saved!");
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
