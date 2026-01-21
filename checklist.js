// ===================================
// Checklist Page Module
// ===================================

const Checklist = {
    checklistItems: [
        { id: 'mirrors', label: 'Adjust all mirrors', icon: '🪞' },
        { id: 'seatbelt', label: 'Fasten seatbelt', icon: '🔒' },
        { id: 'seat', label: 'Adjust seat position', icon: '💺' },
        { id: 'lights', label: 'Check headlights and signals', icon: '💡' },
        { id: 'brakes', label: 'Test brakes', icon: '🛑' },
        { id: 'fuel', label: 'Check fuel level', icon: '⛽' },
        { id: 'tires', label: 'Inspect tire pressure', icon: '🛞' },
        { id: 'surroundings', label: 'Check surroundings', icon: '👀' }
    ],

    checkedItems: new Set(),

    // Initialize checklist
    init() {
        this.loadChecklist();
        this.renderChecklist();
        this.setupEventListeners();
    },

    // Load checklist state
    loadChecklist() {
        const saved = Storage.getChecklist();
        if (saved && saved.items) {
            this.checkedItems = new Set(saved.items);
        }
    },

    // Save checklist state
    saveChecklist() {
        Storage.saveChecklist({
            items: Array.from(this.checkedItems),
            lastUpdated: new Date().toISOString()
        });
    },

    // Render checklist items
    renderChecklist() {
        const container = document.getElementById('checklist-items');
        if (!container) return;

        container.innerHTML = this.checklistItems.map(item => {
            const isChecked = this.checkedItems.has(item.id);
            return `
        <div class="checkbox-wrapper">
          <input 
            type="checkbox" 
            id="check-${item.id}" 
            class="checkbox" 
            ${isChecked ? 'checked' : ''}
            data-item-id="${item.id}"
          >
          <label for="check-${item.id}" class="checkbox-label">
            <span class="icon">${item.icon}</span>
            ${item.label}
          </label>
        </div>
      `;
        }).join('');

        // Add event listeners to checkboxes
        container.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = e.target.dataset.itemId;
                if (e.target.checked) {
                    this.checkedItems.add(itemId);
                } else {
                    this.checkedItems.delete(itemId);
                }
                this.saveChecklist();
            });
        });
    },

    // Setup event listeners
    setupEventListeners() {
        const completeBtn = document.getElementById('complete-checklist-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeChecklist());
        }

        const resetBtn = document.getElementById('reset-checklist-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetChecklist());
        }
    },

    // Complete checklist
    completeChecklist() {
        const allChecked = this.checkedItems.size === this.checklistItems.length;

        if (!allChecked) {
            alert('⚠️ Please complete all safety checks before proceeding!');
            return;
        }

        // Mark checklist as completed
        const checklistData = Storage.getChecklist();
        checklistData.completed = true;
        checklistData.completedAt = new Date().toISOString();
        Storage.saveChecklist(checklistData);

        alert('✅ Great job! All safety checks complete. You\'re ready to drive safely!');

        // Update Dashboard if it exists
        if (typeof Dashboard !== 'undefined' && Dashboard.updateStartDriveButton) {
            Dashboard.updateStartDriveButton();
        }
    },

    // Reset checklist
    resetChecklist() {
        this.checkedItems.clear();
        this.saveChecklist();
        this.renderChecklist();
    },

    // Check if checklist is complete
    isComplete() {
        return this.checkedItems.size === this.checklistItems.length;
    }
};
