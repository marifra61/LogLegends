// ===================================
// Educational Tips Module
// ===================================

const Tips = {
    tips: [
        "Always check your mirrors before changing lanes or merging.",
        "Maintain a safe following distance - use the 3-second rule.",
        "Scan the road 12-15 seconds ahead to anticipate hazards.",
        "Use turn signals at least 100 feet before turning.",
        "Keep both hands on the wheel at 9 and 3 o'clock positions.",
        "Avoid distractions - no phone use while driving!",
        "Adjust your speed for weather and road conditions.",
        "Always wear your seatbelt and ensure passengers do too.",
        "Check blind spots before changing lanes.",
        "Practice defensive driving - anticipate other drivers' actions.",
        "Never drive when tired or under the influence.",
        "Keep a safe distance from large trucks and buses.",
        "Use headlights in low visibility conditions.",
        "Obey all traffic signs and signals.",
        "Be extra cautious in school zones and residential areas."
    ],

    shownTips: new Set(),

    // Get a random tip that hasn't been shown recently
    getRandomTip() {
        // Reset if all tips have been shown
        if (this.shownTips.size >= this.tips.length) {
            this.shownTips.clear();
        }

        // Get tips that haven't been shown
        const availableTips = this.tips.filter((_, index) => !this.shownTips.has(index));

        // Pick a random one
        const randomIndex = Math.floor(Math.random() * availableTips.length);
        const tip = availableTips[randomIndex];

        // Mark as shown
        const originalIndex = this.tips.indexOf(tip);
        this.shownTips.add(originalIndex);

        return tip;
    },

    // Show tip modal
    showTip() {
        const tip = this.getRandomTip();
        const tipContent = document.getElementById('tip-content');
        const tipModal = document.getElementById('tip-modal');

        if (tipContent && tipModal) {
            tipContent.textContent = tip;
            tipModal.classList.add('active');
        }
    },

    // Close tip modal
    closeTip() {
        const tipModal = document.getElementById('tip-modal');
        if (tipModal) {
            tipModal.classList.remove('active');
        }
    },

    // Initialize tip modal handlers
    init() {
        const closeTipBtn = document.getElementById('close-tip-modal');
        const dismissTipBtn = document.getElementById('dismiss-tip-btn');

        if (closeTipBtn) {
            closeTipBtn.addEventListener('click', () => this.closeTip());
        }

        if (dismissTipBtn) {
            dismissTipBtn.addEventListener('click', () => this.closeTip());
        }

        // Close on overlay click
        const tipModal = document.getElementById('tip-modal');
        if (tipModal) {
            tipModal.addEventListener('click', (e) => {
                if (e.target === tipModal) {
                    this.closeTip();
                }
            });
        }
    }
};
