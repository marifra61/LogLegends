// Freemium system with Stripe integration

// Stripe publishable key (you'll need to replace this with your actual key)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE'; // Replace with your key

// Premium pricing
const PREMIUM_PLANS = {
    monthly: {
        priceId: 'price_monthly', // Replace with actual Stripe price ID
        amount: 2.99,
        interval: 'month',
        name: 'Monthly Premium'
    },
    yearly: {
        priceId: 'price_yearly', // Replace with actual Stripe price ID
        amount: 19.99,
        interval: 'year',
        name: 'Yearly Premium (Save 44%!)'
    }
};

// Check if user has premium
window.isPremiumUser = function() {
    const premiumStatus = localStorage.getItem('premium_user');
    const expiryDate = localStorage.getItem('premium_expiry');
    
    if (premiumStatus === 'true') {
        // Check if subscription is still valid
        if (expiryDate) {
            const expiry = new Date(expiryDate);
            if (expiry > new Date()) {
                return true;
            } else {
                // Subscription expired
                localStorage.removeItem('premium_user');
                localStorage.removeItem('premium_expiry');
                return false;
            }
        }
        return true;
    }
    
    return false;
};

// Show upgrade/pricing modal
window.showPricingModal = function() {
    const modal = document.createElement('div');
    modal.id = 'pricing-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
    `;
    
    const isPremium = window.isPremiumUser();
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            padding: 30px 25px;
            border-radius: 20px;
            max-width: 450px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        ">
            <button onclick="document.getElementById('pricing-modal').remove()" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 1.5rem;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
            ">×</button>
            
            <h2 style="color: white; font-size: 2rem; margin-bottom: 10px; text-align: center;">
                ${isPremium ? '✨ Premium Active' : '✨ Upgrade to Premium'}
            </h2>
            
            ${isPremium ? `
                <div style="text-align: center; padding: 20px; background: rgba(0, 230, 118, 0.1); border-radius: 12px; margin-bottom: 20px;">
                    <p style="color: #00e676; font-size: 1.1rem; font-weight: bold;">You're a Premium member!</p>
                    <p style="color: #aaa; margin-top: 10px; font-size: 0.9rem;">Expires: ${localStorage.getItem('premium_expiry') ? new Date(localStorage.getItem('premium_expiry')).toLocaleDateString() : 'Never'}</p>
                </div>
            ` : `
                <p style="color: #aaa; text-align: center; margin-bottom: 25px;">
                    Unlock all features and support development
                </p>
            `}
            
            <div style="margin-bottom: 25px;">
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; margin-bottom: 12px;">
                    <p style="color: white; font-weight: bold; margin-bottom: 12px;">✅ Premium Features:</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">📄 Export DMV-ready PDFs</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">☁️ Unlimited cloud storage</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">🗺️ Advanced route analytics</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">📊 Detailed driving statistics</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">🎯 Priority support</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">🔒 No ads ever</p>
                </div>
                
                ${!isPremium ? `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px;">
                    <p style="color: white; font-weight: bold; margin-bottom: 12px;">🆓 Free Features:</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">⏱️ Unlimited trip tracking</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">🚗 Pre-drive safety checklist</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">📍 Basic GPS tracking</p>
                    <p style="color: #ddd; font-size: 0.95rem; margin: 8px 0; padding-left: 10px;">📱 Local data storage</p>
                </div>
                ` : ''}
            </div>
            
            ${!isPremium ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div onclick="selectPlan('monthly')" id="plan-monthly" class="pricing-card" style="
                        background: rgba(255, 255, 255, 0.08);
                        padding: 20px 15px;
                        border-radius: 12px;
                        text-align: center;
                        cursor: pointer;
                        border: 2px solid transparent;
                        transition: all 0.3s;
                    ">
                        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 8px;">Monthly</p>
                        <p style="color: white; font-size: 2rem; font-weight: bold;">$2.99</p>
                        <p style="color: #aaa; font-size: 0.85rem;">per month</p>
                    </div>
                    
                    <div onclick="selectPlan('yearly')" id="plan-yearly" class="pricing-card" style="
                        background: linear-gradient(135deg, #00e676, #00c853);
                        padding: 20px 15px;
                        border-radius: 12px;
                        text-align: center;
                        cursor: pointer;
                        border: 2px solid #00e676;
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            top: -10px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: #ff6b35;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 12px;
                            font-size: 0.75rem;
                            font-weight: bold;
                        ">BEST VALUE</div>
                        <p style="color: rgba(0, 0, 0, 0.7); font-size: 0.9rem; margin-bottom: 8px;">Yearly</p>
                        <p style="color: white; font-size: 2rem; font-weight: bold;">$19.99</p>
                        <p style="color: rgba(0, 0, 0, 0.7); font-size: 0.85rem;">$1.67/month</p>
                        <p style="color: rgba(0, 0, 0, 0.8); font-size: 0.75rem; margin-top: 5px; font-weight: bold;">Save 44%!</p>
                    </div>
                </div>
                
                <button onclick="initiateCheckout()" id="checkout-btn" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 18px 30px;
                    border-radius: 12px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 15px;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                ">Subscribe Now</button>
                
                <p style="color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 10px;">
                    💳 Secure payment via Stripe
                </p>
                <p style="color: #888; font-size: 0.8rem; text-align: center;">
                    Cancel anytime • 7-day money-back guarantee
                </p>
            ` : `
                <button onclick="manageSubscription()" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 2px solid white;
                    padding: 15px 30px;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 10px;
                ">Manage Subscription</button>
                
                <button onclick="document.getElementById('pricing-modal').remove()" style="
                    background: transparent;
                    color: #888;
                    border: none;
                    padding: 12px;
                    font-size: 0.95rem;
                    cursor: pointer;
                    width: 100%;
                ">Close</button>
            `}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Select yearly by default
    if (!isPremium) {
        selectPlan('yearly');
    }
};

let selectedPlan = 'yearly';

// Select a pricing plan
window.selectPlan = function(plan) {
    selectedPlan = plan;
    
    // Update UI to show selected plan
    const monthlyCard = document.getElementById('plan-monthly');
    const yearlyCard = document.getElementById('plan-yearly');
    
    if (monthlyCard && yearlyCard) {
        monthlyCard.style.border = '2px solid transparent';
        yearlyCard.style.border = '2px solid #00e676';
        
        if (plan === 'monthly') {
            monthlyCard.style.border = '2px solid #667eea';
            monthlyCard.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        } else {
            monthlyCard.style.background = 'rgba(255, 255, 255, 0.08)';
        }
    }
};

// Initiate Stripe checkout
window.initiateCheckout = async function() {
    const plan = PREMIUM_PLANS[selectedPlan];
    
    // Show loading state
    const btn = document.getElementById('checkout-btn');
    if (btn) {
        btn.textContent = 'Processing...';
        btn.disabled = true;
    }
    
    // For development/testing: Simulate payment
    if (STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_KEY_HERE') {
        // DEMO MODE - Activate premium without payment
        setTimeout(() => {
            if (confirm(`Demo Mode: Activate ${plan.name} for $${plan.amount}?`)) {
                activatePremium(selectedPlan);
                document.getElementById('pricing-modal').remove();
                alert('✅ Premium activated! (Demo mode - no payment processed)');
            } else {
                if (btn) {
                    btn.textContent = 'Subscribe Now';
                    btn.disabled = false;
                }
            }
        }, 500);
        return;
    }
    
    // PRODUCTION MODE - Real Stripe integration
    try {
        // Load Stripe
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        
        // Get user info
        const userId = localStorage.getItem('log_uid');
        const userEmail = localStorage.getItem('log_email');
        
        // Create checkout session via your backend
        const response = await fetch('YOUR_BACKEND_URL/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: plan.priceId,
                userId: userId,
                userEmail: userEmail
            })
        });
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            alert('Payment failed: ' + result.error.message);
            if (btn) {
                btn.textContent = 'Subscribe Now';
                btn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Error starting checkout. Please try again.');
        if (btn) {
            btn.textContent = 'Subscribe Now';
            btn.disabled = false;
        }
    }
};

// Activate premium status
function activatePremium(planType) {
    const plan = PREMIUM_PLANS[planType];
    
    // Calculate expiry date
    const expiryDate = new Date();
    if (plan.interval === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (plan.interval === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    // Save premium status
    localStorage.setItem('premium_user', 'true');
    localStorage.setItem('premium_expiry', expiryDate.toISOString());
    localStorage.setItem('premium_plan', planType);
    
    console.log('Premium activated:', planType, 'Expires:', expiryDate);
    
    // Update UI if needed
    updatePremiumBadge();
}

// Manage subscription (opens Stripe customer portal)
window.manageSubscription = function() {
    alert('This would open the Stripe Customer Portal where you can:\n\n• Update payment method\n• View invoices\n• Cancel subscription\n• Update billing info');
    
    // In production, redirect to Stripe Customer Portal
    // window.location.href = 'YOUR_BACKEND_URL/customer-portal';
};

// Update premium badge in UI
function updatePremiumBadge() {
    const syncArea = document.getElementById('sync-status-area');
    if (syncArea && window.isPremiumUser()) {
        // Add premium badge
        const userInfo = document.getElementById('user-info');
        if (userInfo && !userInfo.querySelector('.premium-badge')) {
            const badge = document.createElement('span');
            badge.className = 'premium-badge';
            badge.textContent = '⭐ PRO';
            badge.style.cssText = `
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #000;
                padding: 3px 8px;
                border-radius: 8px;
                font-size: 0.7rem;
                font-weight: bold;
                margin-left: 8px;
            `;
            userInfo.appendChild(badge);
        }
    }
}

// Check premium status on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePremiumBadge);
} else {
    updatePremiumBadge();
}

console.log('Freemium system loaded. Premium status:', window.isPremiumUser());
