// ===================================
// Dashboard Page Module
// ===================================

const Dashboard = {
    activeDrive: null,
    driveTimer: null,
    driveStartTime: null,

    // Initialize dashboard
    init() {
        this.updateStats();
        this.updateRecentDrives();
        this.setupEventListeners();
        this.checkActiveDrive();
        this.updateStartDriveButton();
    },

    // Setup event listeners
    setupEventListeners() {
        const startDriveBtn = document.getElementById('start-drive-btn');
        if (startDriveBtn) {
            startDriveBtn.addEventListener('click', () => this.startDrive());
        }

        const endDriveBtn = document.getElementById('end-drive-btn');
        if (endDriveBtn) {
            endDriveBtn.addEventListener('click', () => this.endDrive());
        }

        const dashboardStopBtn = document.getElementById('dashboard-stop-btn');
        if (dashboardStopBtn) {
            dashboardStopBtn.addEventListener('click', () => this.endDrive());
        }

        const closeDriveModal = document.getElementById('close-drive-modal');
        if (closeDriveModal) {
            closeDriveModal.addEventListener('click', () => this.closeDriveModal());
        }

        // Voice input button
        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
    },

    // Check for active drive on load
    checkActiveDrive() {
        const activeDrive = Storage.getActiveDrive();
        if (activeDrive) {
            this.activeDrive = activeDrive;
            this.driveStartTime = new Date(activeDrive.startTime);
            this.updateDashboardUI(true);
            this.startTimer();
        }
    },

    // Update statistics
    updateStats() {
        const requirements = Storage.getLicenseRequirements();
        const stats = Storage.getStats();
        const profile = Storage.getProfile();

        // Update total hours progress (Mini top bar)
        const topTotalProgressBar = document.getElementById('top-total-progress-bar');
        const totalHoursBadge = document.getElementById('total-hours-badge');
        if (topTotalProgressBar) {
            topTotalProgressBar.style.width = `${requirements.total.progress}%`;
        }
        if (totalHoursBadge) {
            totalHoursBadge.textContent = `${requirements.total.current.toFixed(1)} / ${requirements.total.goal}h`;
        }

        // Update top mini displays
        const topNightDisplay = document.getElementById('top-night-hours-display');
        const topWeeklyDisplay = document.getElementById('top-weekly-hours-display');
        if (topNightDisplay) {
            topNightDisplay.textContent = `${requirements.night.current.toFixed(1)}/${requirements.night.goal}h`;
        }
        if (topWeeklyDisplay) {
            topWeeklyDisplay.textContent = `${requirements.weekly.current.toFixed(1)}/${requirements.weekly.limit}h`;
        }

        // Update stat cards
        const totalDrivesEl = document.getElementById('total-drives');
        const dayDrivesEl = document.getElementById('day-drives');
        const nightDrivesEl = document.getElementById('night-drives');
        const safetyScoreEl = document.getElementById('safety-score');

        if (totalDrivesEl) totalDrivesEl.textContent = stats.totalDrives;
        if (dayDrivesEl) dayDrivesEl.textContent = stats.dayDrives;
        if (nightDrivesEl) nightDrivesEl.textContent = stats.nightDrives;
        if (safetyScoreEl) safetyScoreEl.textContent = profile.safetyScore || 100;

        // Update Start Drive button state
        this.updateStartDriveButton();
    },

    // Update recent drives list
    updateRecentDrives() {
        const drives = Storage.getDrives();
        const recentDrivesList = document.getElementById('recent-drives-list');

        if (!recentDrivesList) return;

        if (drives.length === 0) {
            recentDrivesList.innerHTML = '<p class="text-center" style="color: var(--color-text-muted);">No drives yet. Start your first drive!</p>';
            return;
        }

        // Show last 5 drives
        const recentDrives = drives.slice(0, 5);
        recentDrivesList.innerHTML = recentDrives.map(drive => {
            const date = new Date(drive.startTime);
            const timeOfDayIcon = drive.timeOfDay === 'day' ? '☀️' : '🌙';
            const weatherIcon = this.getWeatherIcon(drive.weather);

            return `
        <div class="list-item">
          <div class="list-item-header">
            <span class="list-item-title">${timeOfDayIcon} ${weatherIcon} ${drive.duration.toFixed(1)} hours</span>
            <span class="badge badge-success">${drive.timeOfDay}</span>
          </div>
          <div class="list-item-meta">
            ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          ${drive.notes ? `<p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--spacing-xs);">${drive.notes}</p>` : ''}
        </div>
      `;
        }).join('');
    },

    // Get weather icon
    getWeatherIcon(weather) {
        const icons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            snowy: '❄️',
            foggy: '🌫️'
        };
        return icons[weather] || '☀️';
    },

    // Start a new drive
    startDrive() {
        // Request location permission and get start coordinates
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.initiateDrive(position);
                },
                (error) => {
                    console.error('Error getting start location:', error);
                    // Still allow starting the drive but notify the user
                    const proceed = confirm('Could not get your exact location. Start drive anyway?');
                    if (proceed) {
                        this.initiateDrive(null);
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            console.warn('Geolocation not available');
            this.initiateDrive(null);
        }
    },

    // Internal helper to handle drive initialization
    initiateDrive(position) {
        this.driveStartTime = new Date();
        const startLocation = position ? {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
        } : null;

        this.activeDrive = {
            startTime: this.driveStartTime.toISOString(),
            startLocation: startLocation,
            weather: 'sunny',
            notes: ''
        };

        Storage.saveActiveDrive(this.activeDrive);
        this.updateDashboardUI(true);
        this.startTimer();
    },

    // Update Dashboard UI elements based on active drive state
    updateDashboardUI(isActive) {
        const activeDriveDisplay = document.getElementById('active-drive-display');
        const startDriveSection = document.getElementById('start-drive-section');
        const modal = document.getElementById('active-drive-modal');

        if (isActive) {
            if (activeDriveDisplay) activeDriveDisplay.style.display = 'block';
            if (startDriveSection) startDriveSection.style.display = 'none';
            // Show modal for additional input
            if (modal) modal.classList.add('active');
        } else {
            if (activeDriveDisplay) activeDriveDisplay.style.display = 'none';
            if (startDriveSection) startDriveSection.style.display = 'block';
            if (modal) modal.classList.remove('active');
        }
    },

    // Close drive modal (but keep drive active)
    closeDriveModal() {
        const modal = document.getElementById('active-drive-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Start drive timer
    startTimer() {
        this.updateTimer();
        this.driveTimer = setInterval(() => this.updateTimer(), 1000);
    },

    // Update timer display
    updateTimer() {
        if (!this.driveStartTime) return;

        const now = new Date();
        const elapsed = Math.floor((now - this.driveStartTime) / 1000);

        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timerDisplayModal = document.getElementById('drive-timer');
        const timerDisplayDashboard = document.getElementById('dashboard-timer');

        if (timerDisplayModal) timerDisplayModal.textContent = timeStr;
        if (timerDisplayDashboard) timerDisplayDashboard.textContent = timeStr;
    },

    // End drive
    endDrive() {
        if (!this.activeDrive || !this.driveStartTime) return;

        // Request location for end coordinate
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.completeDrive(position);
                },
                (error) => {
                    console.error('Error getting end location:', error);
                    this.completeDrive(null);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            this.completeDrive(null);
        }
    },

    // Internal helper to finalize drive data
    completeDrive(endPosition) {
        // Stop timer
        if (this.driveTimer) {
            clearInterval(this.driveTimer);
            this.driveTimer = null;
        }

        // Calculate duration
        const endTime = new Date();
        const durationMs = endTime - this.driveStartTime;
        const durationHours = durationMs / (1000 * 60 * 60);

        // Get notes and weather
        const notesInput = document.getElementById('trip-notes');
        const weatherSelect = document.getElementById('weather-select');

        // Determine time of day
        const hour = this.driveStartTime.getHours();
        const timeOfDay = (hour >= 6 && hour < 18) ? 'day' : 'night';

        const endLocation = endPosition ? {
            lat: endPosition.coords.latitude,
            lng: endPosition.coords.longitude,
            accuracy: endPosition.coords.accuracy,
            timestamp: endPosition.timestamp
        } : null;

        // Create drive record
        const drive = {
            startTime: this.driveStartTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: durationHours,
            timeOfDay: timeOfDay,
            weather: weatherSelect ? weatherSelect.value : 'sunny',
            notes: notesInput ? notesInput.value : '',
            date: this.driveStartTime.toLocaleDateString(),
            startLocation: this.activeDrive.startLocation,
            endLocation: endLocation
        };

        // Save drive
        Storage.addDrive(drive);
        Storage.clearActiveDrive();

        // Reset state
        this.activeDrive = null;
        this.driveStartTime = null;

        // Clear form
        if (notesInput) notesInput.value = '';
        if (weatherSelect) weatherSelect.value = 'sunny';

        // UI Updates
        this.updateDashboardUI(false);
        this.updateStats();
        this.updateRecentDrives();

        // Show educational tip
        Tips.showTip();
    },

    // Toggle voice input
    toggleVoiceInput() {
        const voiceBtnText = document.getElementById('voice-btn-text');
        const notesInput = document.getElementById('trip-notes');

        Voice.toggle(
            (finalTranscript, interimTranscript) => {
                if (notesInput && finalTranscript) {
                    notesInput.value += finalTranscript;
                }
            },
            () => {
                if (voiceBtnText) {
                    voiceBtnText.textContent = 'Start Voice Input';
                }
            }
        );

        if (voiceBtnText) {
            voiceBtnText.textContent = Voice.isListening ? 'Stop Voice Input' : 'Start Voice Input';
        }
    },

    // Update Start Drive button state based on checklist completion
    updateStartDriveButton() {
        const startDriveBtn = document.getElementById('start-drive-btn');
        const checklistWarning = document.getElementById('checklist-warning');
        if (!startDriveBtn) return;

        const checklistData = Storage.getChecklist();
        const isChecklistComplete = checklistData && checklistData.completed === true;

        if (isChecklistComplete) {
            startDriveBtn.disabled = false;
            startDriveBtn.style.opacity = '1';
            if (checklistWarning) checklistWarning.style.display = 'none';
        } else {
            startDriveBtn.disabled = true;
            startDriveBtn.style.opacity = '0.5';
            if (checklistWarning) checklistWarning.style.display = 'block';
        }
    },

    // Refresh dashboard
    refresh() {
        this.updateStats();
        this.updateRecentDrives();
    }
};

