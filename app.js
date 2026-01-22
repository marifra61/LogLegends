let map;
let startTime;
let driveInterval;

// Global State
const LogLegendsState = {
    isUnlocked: false,
    totalHours: 0
};

// 1. Navigation & Page Management
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    if (pageId === 'dashboard') {
        refreshDashboardUI();
    }
}

// 2. Dashboard UI Refresh
function refreshDashboardUI() {
    const startBtn = document.getElementById('start-drive-btn');
    const warning = document.getElementById('checklist-warning');
    
    if (LogLegendsState.isUnlocked) {
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
        startBtn.style.backgroundColor = "#00e5ff";
        startBtn.style.color = "#000";
        warning.style.display = "none";
    } else {
        startBtn.disabled = true;
        startBtn.style.opacity = "0.5";
        warning.style.display = "block";
    }
}

// 3. Checklist Verification (The Bridge)
function verifySafetyChecklist() {
    const checks = document.querySelectorAll('.vibe-check');
    const allDone = Array.from(checks).every(c => c.checked);
    
    if (allDone) {
        LogLegendsState.isUnlocked = true;
        alert(" Safety Protocol Clear. Drive Unlocked.");
        showPage('dashboard'); // This calls refreshDashboardUI()
    } else {
        alert(" All safety items must be checked before driving.");
    }
}

// 4. Map & App Initialization
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map-display"), {
        center: { lat: 35.584, lng: -78.800 }, 
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }]
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Page Nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => showPage(btn.dataset.page);
    });

    // Checklist Button
    document.getElementById('complete-checklist-btn').onclick = verifySafetyChecklist;

    // Start/Stop Drive Button
    const startBtn = document.getElementById('start-drive-btn');
    startBtn.onclick = function() {
        if (startBtn.textContent === "START DRIVE") {
            startBtn.textContent = "STOP DRIVE";
            startBtn.style.backgroundColor = "#ff4444";
            startBtn.style.color = "#fff";
            startTime = Date.now();
            driveInterval = setInterval(updateTimer, 1000);
        } else {
            clearInterval(driveInterval);
            LogLegendsState.isUnlocked = false; // Reset for next drive
            startBtn.textContent = "START DRIVE";
            alert("Drive session logged to history!");
            refreshDashboardUI();
        }
    };

    // Load Maps API
    const apiKey = "AIzaSyB1DACu4yoRMzIdvo0USYc-Gg4vtRvEDZk"; 
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    document.head.appendChild(script);
});

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${hrs}:${mins}:${secs}`;
}
