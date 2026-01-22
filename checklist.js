// Checklist items for pre-drive safety
const checklistItems = [
    { id: 'mirrors', label: 'Adjust all mirrors (side and rear-view)' },
    { id: 'seat', label: 'Adjust seat position and headrest' },
    { id: 'seatbelt', label: 'Fasten seatbelt securely' },
    { id: 'lights', label: 'Check all lights are working' },
    { id: 'signals', label: 'Test turn signals and hazards' },
    { id: 'tires', label: 'Visually inspect tire pressure' },
    { id: 'phone', label: 'Phone is silenced or stored away' },
    { id: 'passengers', label: 'All passengers buckled in' }
];

// Initialize checklist on page load
function initializeChecklist() {
    const container = document.getElementById('checklist-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    checklistItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <input type="checkbox" id="check-${item.id}" class="safety-checkbox">
            <label for="check-${item.id}">${item.label}</label>
        `;
        container.appendChild(div);
    });
    
    console.log('Checklist initialized with', checklistItems.length, 'items');
}

// Validate all checkboxes are checked
window.validateChecklist = function() {
    const allCheckboxes = document.querySelectorAll('.safety-checkbox');
    const checkedCount = document.querySelectorAll('.safety-checkbox:checked').length;
    
    console.log(`Checked: ${checkedCount}/${allCheckboxes.length}`);
    
    if (checkedCount === allCheckboxes.length) {
        // Enable the start button
        const startBtn = document.getElementById('start-drive-btn');
        const safetyStatus = document.getElementById('safety-status');
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            startBtn.classList.add('enabled');
        }
        
        if (safetyStatus) {
            safetyStatus.textContent = '✓ Safety Check Complete';
            safetyStatus.style.background = 'linear-gradient(90deg, #00e676, #00c853)';
        }
        
        // Mark checklist as complete
        localStorage.setItem('safety_check_complete', 'true');
        
        alert('✓ Safety check complete! You can now start your drive from the Dashboard.');
        
        // Navigate back to dashboard
        if (window.showPage) {
            window.showPage('dashboard');
        }
    } else {
        alert(`Please complete all ${allCheckboxes.length} safety checks before proceeding.`);
    }
};

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChecklist);
} else {
    initializeChecklist();
}
