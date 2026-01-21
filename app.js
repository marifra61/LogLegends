// ===================================
// Main Application Module
// ===================================

const App = {
    currentPage: 'dashboard',

    // Initialize application
    init() {
        console.log('🚗 LogLegends initializing...');

        // Initialize all modules
        Tips.init();
        Premium.init();
        Dashboard.init();
        Checklist.init();
        Timeline.init();
        Map.init();
        Profile.init();

        // Setup navigation
        this.setupNavigation();

        // Handle initial route
        this.handleRoute();

        console.log('✅ LogLegends ready!');
    },

    // Setup navigation handlers
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    },

    // Navigate to a page
    navigateTo(pageName) {
        // Update URL
        window.history.pushState({ page: pageName }, '', `#${pageName}`);

        // Show page
        this.showPage(pageName);
    },

    // Handle route from URL
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.showPage(hash);
    },

    // Show specific page
    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        }

        // Update navigation
        this.updateNavigation(pageName);

        // Refresh page content
        this.refreshPage(pageName);
    },

    // Update navigation active state
    updateNavigation(pageName) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    // Refresh page content
    refreshPage(pageName) {
        switch (pageName) {
            case 'dashboard':
                Dashboard.refresh();
                break;
            case 'checklist':
                // Checklist doesn't need refresh
                break;
            case 'timeline':
                Timeline.refresh();
                break;
            case 'map':
                Map.refresh();
                break;
            case 'profile':
                Profile.refresh();
                break;
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
