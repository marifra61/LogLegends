const Storage = {
    DB_NAME: 'loglegends_data',

    // Initialize data if it doesn't exist
    init() {
        if (!localStorage.getItem(this.DB_NAME)) {
            const initialData = {
                profile: { totalHours: 0, goal: 60, nightHours: 0, nightGoal: 10 },
                drives: []
            };
            localStorage.setItem(this.DB_NAME, JSON.stringify(initialData));
        }
    },

    getData() {
        return JSON.parse(localStorage.getItem(this.DB_NAME));
    },

    saveDrive(drive) {
        const data = this.getData();
        data.drives.push(drive);
        
        // Update total progress
        data.profile.totalHours += drive.duration;
        if (drive.isNight) {
            data.profile.nightHours += drive.duration;
        }
        
        localStorage.setItem(this.DB_NAME, JSON.stringify(data));
    }
};

export default Storage;
