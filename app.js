// LogLegends Integrated Engine
let map;
let startTime;
let driveInterval;

const ChecklistData = [
    { id: 'mirrors', label: 'Mirrors Adjusted', icon: '' },
    { id: 'seatbelt', label: 'Seatbelt Fastened', icon: '' },
    { id: 'phone', label: 'Phone Mounted', icon: '' },
    { id: 'lights', label: 'Lights Checked', icon: '' }
];

// Navigation Logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

// Checklist Rendering (From checklist.js)
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
    
    // Page Swapping Listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => showPage(btn.dataset.page));
    });

    // Start Drive Unlock Logic (From dashboard.js)
    document.getElementById('complete-checklist-btn').addEventListener('click', () => {
        const checks = document.querySelectorAll('.vibe-check');
        const allChecked = Array.from(checks).every(c => c.checked);
        
        if (allChecked) {
            document.getElementById('start-drive-btn').disabled = false;
            document.getElementById('start-drive-btn').style.opacity = "1";
            document.getElementById('checklist-warning').style.display = "none";
            alert(" Safety Checks Complete. Returning to Dashboard.");
            showPage('dashboard');
        } else {
            alert(" Please complete all safety checks first!");
        }
    });

    // Map Loader
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});
