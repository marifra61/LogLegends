// ===================================
// Timeline Page Module
// ===================================

const Timeline = {
    allDrives: [],
    filteredDrives: [],

    // Initialize timeline
    init() {
        this.loadDrives();
        this.renderTimeline();
        this.setupEventListeners();
    },

    // Load drives from storage
    loadDrives() {
        this.allDrives = Storage.getDrives();
        this.filteredDrives = [...this.allDrives];
    },

    // Setup event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('timeline-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterDrives(e.target.value));
        }
    },

    // Filter drives based on search
    filterDrives(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredDrives = this.allDrives.filter(drive => {
            return (
                drive.notes?.toLowerCase().includes(lowerQuery) ||
                drive.weather?.toLowerCase().includes(lowerQuery) ||
                drive.timeOfDay?.toLowerCase().includes(lowerQuery) ||
                drive.date?.toLowerCase().includes(lowerQuery)
            );
        });
        this.renderTimeline();
    },

    // Render timeline
    renderTimeline() {
        const container = document.getElementById('timeline-list');
        if (!container) return;

        if (this.filteredDrives.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: var(--color-text-muted);">No driving history found.</p>';
            return;
        }

        container.innerHTML = this.filteredDrives.map((drive, index) => {
            const startDate = new Date(drive.startTime);
            const endDate = new Date(drive.endTime);
            const timeOfDayIcon = drive.timeOfDay === 'day' ? '☀️' : '🌙';
            const weatherIcon = this.getWeatherIcon(drive.weather);

            return `
        <div class="card mb-md">
          <div class="card-header">
            <div>
              <h3 class="card-title">Drive #${this.allDrives.length - index}</h3>
              <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0;">
                ${startDate.toLocaleDateString()} • ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div class="flex gap-sm">
              <span class="badge badge-${drive.timeOfDay === 'day' ? 'warning' : 'secondary'}">${timeOfDayIcon} ${drive.timeOfDay}</span>
            </div>
          </div>
          
          <div class="stats-grid" style="margin: var(--spacing-md) 0;">
            <div class="stat-card">
              <span class="stat-value">${drive.duration.toFixed(1)}</span>
              <span class="stat-label">Hours</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${weatherIcon}</span>
              <span class="stat-label">${this.capitalizeFirst(drive.weather)}</span>
            </div>
          </div>
          
          ${drive.notes ? `
            <div style="background: rgba(255, 255, 255, 0.05); padding: var(--spacing-sm); border-radius: var(--radius-md); margin-top: var(--spacing-sm);">
              <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
                <strong>Notes:</strong> ${drive.notes}
              </p>
            </div>
          ` : ''}
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

    // Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Refresh timeline
    refresh() {
        this.loadDrives();
        this.renderTimeline();
    }
};
