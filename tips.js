/**
 * LogLegends Tip System v2.0
 * Dual payment: Stripe (primary) + PayPal (backup)
 * 
 * SETUP:
 * 1. Create Stripe Payment Links in your dashboard (see instructions below)
 * 2. Update the config section with your links
 * 3. Add <script src="tips.js"></script> to index.html
 * 
 * STRIPE PAYMENT LINKS SETUP:
 * 1. Go to Stripe Dashboard → Products → + Add Product
 * 2. Create a product called "LogLegends Tip" (one-time payment)
 * 3. Go to Payment Links → + New
 * 4. Create links for $3, $5, $10, $20
 * 5. Copy each link URL into the config below
 */

const TipSystem = {
    // ========================================
    // CONFIGURATION - UPDATE THESE!
    // ========================================
    config: {
        // Stripe Payment Links - Create these in your Stripe Dashboard
        // Dashboard → Payment Links → + New → Set amount → Copy link
        stripeLinks: {
            3: 'https://buy.stripe.com/9B6aEX71lddKfFj1Nvb3q03',   // Replace with your $3 link
            5: 'https://buy.stripe.com/cNi3cv0CX5LiakZeAhb3q04',   // Replace with your $5 link
            10: 'https://buy.stripe.com/9B66oHadx7Tq64JfElb3q05', // Replace with your $10 link
            20: 'https://buy.stripe.com/6oU5kD5XhflSeBf1Nvb3q06'  // Replace with your $20 link
        },
        
        // PayPal.me backup - your PayPal username or email
        paypalUsername: 'marifradesigns',
        
        // Suggested tip amounts
        suggestedAmounts: [3, 5, 10, 20],
        defaultAmount: 5,
        
        // Branding
        appName: 'LogLegends',
        location: 'North Carolina',
        supportEmail: 'frank@marifradesigns.com'
    },
    // ========================================
    // END CONFIGURATION
    // ========================================

    selectedAmount: 5,
    hasSeenThisSession: false,
    
    // ---- Storage Helpers ----
    getDismissCount() {
        return parseInt(localStorage.getItem('ll_tip_dismiss_count') || '0');
    },
    
    incrementDismissCount() {
        const count = this.getDismissCount() + 1;
        localStorage.setItem('ll_tip_dismiss_count', count.toString());
        return count;
    },
    
    hasTipped() {
        return localStorage.getItem('ll_has_tipped') === 'true';
    },
    
    markAsTipped() {
        localStorage.setItem('ll_has_tipped', 'true');
        localStorage.setItem('ll_tip_date', new Date().toISOString());
    },

    // ---- Display Logic ----
    shouldShowTip(context = 'general') {
        if (this.hasTipped()) return false;
        if (this.hasSeenThisSession && context !== 'milestone') return false;
        if (this.getDismissCount() >= 5 && context !== 'milestone') return false;
        return true;
    },

    // ---- Modal Creation ----
    showTipModal(context = 'general') {
        if (!this.shouldShowTip(context)) {
            console.log('TipSystem: Skipping prompt (context:', context, ')');
            return;
        }
        
        this.hasSeenThisSession = true;
        this.selectedAmount = this.config.defaultAmount;
        
        if (!document.getElementById('ll-tip-modal')) {
            this.createModal();
        }
        
        this.updateContent(context);
        this.updateAmountSelection();
        
        const modal = document.getElementById('ll-tip-modal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        console.log('TipSystem: Showing modal (context:', context, ')');
    },

    createModal() {
        const amounts = this.config.suggestedAmounts;
        const amountButtons = amounts.map(amt => `
            <button class="ll-tip-amt ${amt === this.config.defaultAmount ? 'selected' : ''}" 
                    data-amount="${amt}" 
                    onclick="TipSystem.selectAmount(${amt}, this)">
                <span class="ll-emoji">${this.getEmoji(amt)}</span>
                <span class="ll-price">$${amt}</span>
            </button>
        `).join('');

        const html = `
        <div id="ll-tip-modal" class="ll-tip-overlay">
            <div class="ll-tip-modal">
                <button class="ll-tip-close" onclick="TipSystem.closeModal()" aria-label="Close">×</button>
                
                <div class="ll-tip-header">
                    <span class="ll-tip-icon" id="ll-tip-icon">💚</span>
                    <h2 id="ll-tip-title">Support ${this.config.appName}</h2>
                </div>
                
                <p id="ll-tip-message" class="ll-tip-message">
                    This app is <strong>100% free</strong> because every teen deserves safe driving tools, regardless of family income.
                </p>
                
                <p class="ll-tip-submessage">
                    If ${this.config.appName} helped your family track those driving hours, consider leaving a tip to help cover development costs.
                </p>
                
                <div class="ll-tip-amounts">
                    ${amountButtons}
                </div>
                
                <div class="ll-tip-buttons">
                    <button id="ll-tip-stripe" class="ll-tip-btn ll-stripe" onclick="TipSystem.handleStripeTip()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                        </svg>
                        <span>Tip $<span id="ll-stripe-amount">${this.config.defaultAmount}</span> with Card</span>
                    </button>
                    
                    <button id="ll-tip-paypal" class="ll-tip-btn ll-paypal" onclick="TipSystem.handlePayPalTip()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                        </svg>
                        <span>Tip via PayPal</span>
                    </button>
                </div>
                
                <button class="ll-tip-skip" onclick="TipSystem.skipTip()">
                    Maybe later — I'll keep using it free
                </button>
                
                <p class="ll-tip-footer">
                    🙏 No pressure at all. This app will always be free.<br>
                    <small>Built with ❤️ in ${this.config.location}</small>
                </p>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
        this.injectStyles();
    },

    getEmoji(amount) {
        const emojis = { 3: '☕', 5: '🍕', 10: '⭐', 20: '💝' };
        return emojis[amount] || '💚';
    },

    injectStyles() {
        if (document.getElementById('ll-tip-styles')) return;
        
        const css = `
        <style id="ll-tip-styles">
            .ll-tip-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.75);
                z-index: 99999;
                align-items: center;
                justify-content: center;
                padding: 16px;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
            .ll-tip-overlay.show {
                display: flex;
                animation: llFadeIn 0.25s ease;
            }
            @keyframes llFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .ll-tip-modal {
                background: #fff;
                border-radius: 20px;
                max-width: 400px;
                width: 100%;
                padding: 28px 24px;
                position: relative;
                animation: llSlideUp 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            @keyframes llSlideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ll-tip-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: #f0f0f0;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 22px;
                line-height: 1;
                cursor: pointer;
                color: #666;
                transition: all 0.2s;
            }
            .ll-tip-close:hover {
                background: #e0e0e0;
                color: #333;
            }
            .ll-tip-header {
                text-align: center;
                margin-bottom: 12px;
            }
            .ll-tip-icon {
                font-size: 44px;
                display: block;
                margin-bottom: 4px;
            }
            .ll-tip-header h2 {
                margin: 0;
                font-size: 22px;
                color: #1a1a1a;
                font-weight: 700;
            }
            .ll-tip-message {
                text-align: center;
                color: #444;
                font-size: 15px;
                line-height: 1.5;
                margin: 0 0 6px 0;
            }
            .ll-tip-submessage {
                text-align: center;
                color: #777;
                font-size: 14px;
                line-height: 1.4;
                margin: 0 0 20px 0;
            }
            .ll-tip-amounts {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
                margin-bottom: 18px;
            }
            .ll-tip-amt {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 12px 6px;
                cursor: pointer;
                transition: all 0.15s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .ll-tip-amt:hover {
                border-color: #635bff;
                background: #f8f7ff;
            }
            .ll-tip-amt.selected {
                border-color: #635bff;
                background: #eeecff;
            }
            .ll-emoji { font-size: 24px; }
            .ll-price { font-size: 16px; font-weight: 600; color: #333; }
            .ll-tip-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 12px;
            }
            .ll-tip-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 14px 16px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.2s;
                cursor: pointer;
                border: none;
                width: 100%;
            }
            .ll-stripe {
                background: #635bff;
                color: #fff;
            }
            .ll-stripe:hover {
                background: #5046e5;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99,91,255,0.4);
            }
            .ll-paypal {
                background: #0070ba;
                color: #fff;
            }
            .ll-paypal:hover {
                background: #005ea6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,112,186,0.4);
            }
            .ll-tip-skip {
                width: 100%;
                background: transparent;
                border: none;
                color: #999;
                font-size: 13px;
                cursor: pointer;
                padding: 10px;
                transition: color 0.2s;
            }
            .ll-tip-skip:hover { color: #666; }
            .ll-tip-footer {
                text-align: center;
                color: #aaa;
                font-size: 12px;
                margin: 12px 0 0 0;
                line-height: 1.5;
            }
            .ll-tip-footer small { color: #ccc; }
            
            @media (max-width: 420px) {
                .ll-tip-modal { padding: 22px 18px; border-radius: 16px; }
                .ll-tip-amounts { grid-template-columns: repeat(2, 1fr); }
                .ll-tip-icon { font-size: 36px; }
                .ll-tip-header h2 { font-size: 20px; }
            }
            
            @media (prefers-color-scheme: dark) {
                .ll-tip-modal { background: #1e1e1e; }
                .ll-tip-header h2 { color: #fff; }
                .ll-tip-message { color: #ccc; }
                .ll-tip-submessage { color: #999; }
                .ll-tip-amt { background: #2a2a2a; border-color: #3a3a3a; }
                .ll-tip-amt:hover, .ll-tip-amt.selected { background: #2d2a4a; border-color: #635bff; }
                .ll-price { color: #fff; }
                .ll-tip-close { background: #333; color: #aaa; }
                .ll-tip-close:hover { background: #444; color: #fff; }
            }
        </style>`;
        
        document.head.insertAdjacentHTML('beforeend', css);
    },

    // ---- Context-specific content ----
    updateContent(context) {
        const icon = document.getElementById('ll-tip-icon');
        const title = document.getElementById('ll-tip-title');
        const message = document.getElementById('ll-tip-message');
        
        const content = {
            pdf_export: {
                icon: '📄',
                title: 'PDF Ready!',
                message: 'Your DMV-ready driving log is downloading! If this saved you time and hassle, consider supporting ' + this.config.appName + '.'
            },
            milestone: {
                icon: '🎉',
                title: 'Congratulations!',
                message: "You've hit your driving hour goal! This is a huge milestone. If " + this.config.appName + " helped your family get here, consider leaving a tip."
            },
            settings: {
                icon: '💚',
                title: 'Support ' + this.config.appName,
                message: 'This app is <strong>100% free</strong> because every teen deserves safe driving tools, regardless of family income.'
            },
            general: {
                icon: '💚',
                title: 'Support ' + this.config.appName,
                message: 'This app is <strong>100% free</strong> because every teen deserves safe driving tools, regardless of family income.'
            }
        };
        
        const c = content[context] || content.general;
        if (icon) icon.textContent = c.icon;
        if (title) title.textContent = c.title;
        if (message) message.innerHTML = c.message;
    },

    // ---- Amount Selection ----
    selectAmount(amount, btn) {
        this.selectedAmount = amount;
        
        document.querySelectorAll('.ll-tip-amt').forEach(b => b.classList.remove('selected'));
        if (btn) btn.classList.add('selected');
        
        this.updateAmountSelection();
    },
    
    updateAmountSelection() {
        // Update Stripe button text
        const stripeAmountSpan = document.getElementById('ll-stripe-amount');
        if (stripeAmountSpan) {
            stripeAmountSpan.textContent = this.selectedAmount;
        }
    },

    // ---- Payment Handlers ----
    handleStripeTip() {
        const link = this.config.stripeLinks[this.selectedAmount];
        
        if (!link || link.includes('YOUR_')) {
            // Stripe links not configured - show setup message
            alert('Stripe tips not configured yet. Please use PayPal or contact ' + this.config.supportEmail);
            console.error('TipSystem: Stripe link not configured for $' + this.selectedAmount);
            return;
        }
        
        this.markAsTipped();
        console.log('TipSystem: Stripe tip - $' + this.selectedAmount);
        
        // Open Stripe checkout
        window.open(link, '_blank');
        
        // Close modal after short delay
        setTimeout(() => this.closeModal(), 300);
        
        // Track for thank-you
        sessionStorage.setItem('ll_tip_pending', 'true');
    },
    
    handlePayPalTip() {
        const paypalUrl = `https://www.paypal.com/paypalme/${this.config.paypalUsername}/${this.selectedAmount}`;
        
        this.markAsTipped();
        console.log('TipSystem: PayPal tip - $' + this.selectedAmount);
        
        // Open PayPal
        window.open(paypalUrl, '_blank');
        
        // Close modal
        setTimeout(() => this.closeModal(), 300);
        
        // Track for thank-you
        sessionStorage.setItem('ll_tip_pending', 'true');
    },

    skipTip() {
        this.incrementDismissCount();
        console.log('TipSystem: Skipped (dismiss count:', this.getDismissCount(), ')');
        this.closeModal();
    },

    closeModal() {
        const modal = document.getElementById('ll-tip-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    // ---- Initialization ----
    init() {
        // Check for thank-you moment (user returning from payment)
        if (sessionStorage.getItem('ll_tip_pending') === 'true') {
            sessionStorage.removeItem('ll_tip_pending');
            // Small delay to let page load
            setTimeout(() => this.showThankYou(), 500);
        }
        
        console.log('TipSystem v2.0: Initialized (Stripe + PayPal)');
    },
    
    showThankYou() {
        const toast = document.createElement('div');
        toast.id = 'll-thank-you-toast';
        toast.innerHTML = '💚 Thank you for supporting ' + this.config.appName + '!';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #635bff 0%, #5046e5 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            z-index: 100000;
            box-shadow: 0 4px 20px rgba(99,91,255,0.4);
            animation: llToastIn 0.3s ease;
        `;
        
        if (!document.getElementById('ll-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'll-toast-styles';
            style.textContent = `
                @keyframes llToastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // ---- Testing Helpers ----
    reset() {
        localStorage.removeItem('ll_has_tipped');
        localStorage.removeItem('ll_tip_dismiss_count');
        localStorage.removeItem('ll_tip_date');
        localStorage.removeItem('milestone_reached');
        this.hasSeenThisSession = false;
        console.log('TipSystem: Reset complete');
    },
    
    test(context = 'general') {
        this.hasSeenThisSession = false;
        localStorage.removeItem('ll_has_tipped');
        this.showTipModal(context);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TipSystem.init());
} else {
    TipSystem.init();
}
