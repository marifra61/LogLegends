// ===================================
// Profile Page Module
// ===================================

const Profile = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,

    // Initialize profile page
    init() {
        this.loadProfile();
        this.setupCanvas();
        this.setupEventListeners();
    },

    // Load profile data
    loadProfile() {
        const profile = Storage.getProfile();

        const nameInput = document.getElementById('driver-name');
        const goalInput = document.getElementById('license-goal');
        const safetyScoreEl = document.getElementById('profile-safety-score');

        if (nameInput) nameInput.value = profile.name || '';
        if (goalInput) goalInput.value = profile.licenseGoal || 50;
        if (safetyScoreEl) safetyScoreEl.textContent = profile.safetyScore || 100;

        // Load signature if exists
        const signature = Storage.getSignature();
        if (signature && this.canvas) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = signature;
        }
    },

    // Setup canvas for signature
    setupCanvas() {
        this.canvas = document.getElementById('signature-canvas');
        if (!this.canvas) return;

        // Set canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 150;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    },

    // Start drawing
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    },

    // Draw on canvas
    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        this.lastX = x;
        this.lastY = y;
    },

    // Stop drawing
    stopDrawing() {
        this.isDrawing = false;
    },

    // Setup event listeners
    setupEventListeners() {
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfile());
        }

        const clearSignatureBtn = document.getElementById('clear-signature-btn');
        if (clearSignatureBtn) {
            clearSignatureBtn.addEventListener('click', () => this.clearSignature());
        }

        const saveSignatureBtn = document.getElementById('save-signature-btn');
        if (saveSignatureBtn) {
            saveSignatureBtn.addEventListener('click', () => this.saveSignature());
        }
    },

    // Save profile
    saveProfile() {
        const nameInput = document.getElementById('driver-name');
        const goalInput = document.getElementById('license-goal');

        const profile = Storage.getProfile();
        profile.name = nameInput ? nameInput.value : '';
        profile.licenseGoal = goalInput ? parseInt(goalInput.value) : 50;

        Storage.saveProfile(profile);
        alert('✅ Profile saved successfully!');

        // Update dashboard if needed
        if (Dashboard && Dashboard.updateStats) {
            Dashboard.updateStats();
        }
    },

    // Clear signature
    clearSignature() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    // Save signature
    saveSignature() {
        if (!this.canvas) return;

        const signatureData = this.canvas.toDataURL();
        Storage.saveSignature(signatureData);
        alert('✅ Signature saved successfully!');
    },

    // Refresh profile
    refresh() {
        this.loadProfile();
    }
};
