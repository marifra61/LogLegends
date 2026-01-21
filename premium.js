// ===================================
// Premium Features Module
// ===================================

const Premium = {
    isPremium: false, // Freemium model - default to free

    // Show premium modal
    showModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    // Close premium modal
    closeModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Handle upgrade (placeholder)
    upgrade() {
        alert('🎉 Thank you for your interest! Payment processing will be available soon.');
        this.closeModal();
    },

    // Check if feature is available
    hasAccess(feature) {
        if (this.isPremium) return true;

        // Show paywall for premium features
        this.showModal();
        return false;
    },

    // Generate PDF (premium feature)
    generatePDF() {
        if (!this.hasAccess('pdf-export')) {
            return;
        }

        // PDF generation logic would go here
        alert('PDF generation feature coming soon!');
    },

    // Initialize premium modal handlers
    init() {
        const closePremiumBtn = document.getElementById('close-premium-modal');
        const closePremiumModalBtn = document.getElementById('close-premium-modal-btn');
        const upgradeBtn = document.getElementById('upgrade-btn');
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        const exportTimelinePdfBtn = document.getElementById('export-timeline-pdf-btn');
        const exportProfilePdfBtn = document.getElementById('export-profile-pdf-btn');

        if (closePremiumBtn) {
            closePremiumBtn.addEventListener('click', () => this.closeModal());
        }

        if (closePremiumModalBtn) {
            closePremiumModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.upgrade());
        }

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.generatePDF());
        }

        if (exportTimelinePdfBtn) {
            exportTimelinePdfBtn.addEventListener('click', () => this.generatePDF());
        }

        if (exportProfilePdfBtn) {
            exportProfilePdfBtn.addEventListener('click', () => this.generatePDF());
        }

        // Close on overlay click
        const premiumModal = document.getElementById('premium-modal');
        if (premiumModal) {
            premiumModal.addEventListener('click', (e) => {
                if (e.target === premiumModal) {
                    this.closeModal();
                }
            });
        }
    }
};
