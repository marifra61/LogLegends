// ===================================
// Storage Module - Data Management
// ===================================

const Storage = {
  // Storage keys
  KEYS: {
    DRIVES: 'loglegends_drives',
    PROFILE: 'loglegends_profile',
    CHECKLIST: 'loglegends_checklist',
    SIGNATURE: 'loglegends_signature',
    ACTIVE_DRIVE: 'loglegends_active_drive'
  },

  // Get data from localStorage
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  // Save data to localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  },

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  },

  // Get all drives
  getDrives() {
    return this.get(this.KEYS.DRIVES) || [];
  },

  // Save drives
  saveDrives(drives) {
    return this.set(this.KEYS.DRIVES, drives);
  },

  // Add a new drive
  addDrive(drive) {
    const drives = this.getDrives();
    drives.unshift(drive); // Add to beginning
    return this.saveDrives(drives);
  },

  // Get profile data
  getProfile() {
    return this.get(this.KEYS.PROFILE) || {
      name: '',
      licenseGoal: 60,
      nightHoursGoal: 10,
      weeklyHoursLimit: 10,
      safetyScore: 100
    };
  },

  // Save profile data
  saveProfile(profile) {
    return this.set(this.KEYS.PROFILE, profile);
  },

  // Get checklist state
  getChecklist() {
    return this.get(this.KEYS.CHECKLIST) || {};
  },

  // Save checklist state
  saveChecklist(checklist) {
    return this.set(this.KEYS.CHECKLIST, checklist);
  },

  // Get signature
  getSignature() {
    return this.get(this.KEYS.SIGNATURE);
  },

  // Save signature
  saveSignature(signature) {
    return this.set(this.KEYS.SIGNATURE, signature);
  },

  // Get active drive
  getActiveDrive() {
    return this.get(this.KEYS.ACTIVE_DRIVE);
  },

  // Save active drive
  saveActiveDrive(drive) {
    return this.set(this.KEYS.ACTIVE_DRIVE, drive);
  },

  // Clear active drive
  clearActiveDrive() {
    return this.remove(this.KEYS.ACTIVE_DRIVE);
  },

  // Calculate total hours from drives (respecting weekly cap for compliance)
  getTotalHours() {
    const weeklyHours = this.getWeeklyHours();
    const profile = this.getProfile();
    const weeklyLimit = profile.weeklyHoursLimit || 10;

    // Sum up the hours from each week, but cap each week at the limit
    let totalCappedHours = 0;
    for (const weekKey in weeklyHours) {
      totalCappedHours += Math.min(weeklyHours[weekKey], weeklyLimit);
    }
    return totalCappedHours;
  },

  // Get raw total hours (uncapped)
  getRawTotalHours() {
    const drives = this.getDrives();
    return drives.reduce((total, drive) => total + (drive.duration || 0), 0);
  },

  // Get drive statistics
  getStats() {
    const drives = this.getDrives();
    const totalDrives = drives.length;
    const dayDrives = drives.filter(d => d.timeOfDay === 'day').length;
    const nightDrives = drives.filter(d => d.timeOfDay === 'night').length;
    const totalHours = this.getTotalHours();
    const rawTotalHours = this.getRawTotalHours();
    const nightHours = this.getNightHours();
    const weeklyHours = this.getWeeklyHours();

    return {
      totalDrives,
      dayDrives,
      nightDrives,
      totalHours,
      rawTotalHours,
      nightHours,
      weeklyHours
    };
  },

  // Calculate total night hours
  getNightHours() {
    const drives = this.getDrives();
    return drives
      .filter(d => d.timeOfDay === 'night')
      .reduce((total, drive) => total + (drive.duration || 0), 0);
  },

  // Get hours driven per week (returns array of weekly totals)
  getWeeklyHours() {
    const drives = this.getDrives();
    const weeklyTotals = {};

    drives.forEach(drive => {
      const driveDate = new Date(drive.startTime);
      // Get the week number (ISO week)
      const weekKey = this.getWeekKey(driveDate);

      if (!weeklyTotals[weekKey]) {
        weeklyTotals[weekKey] = 0;
      }
      weeklyTotals[weekKey] += drive.duration || 0;
    });

    return weeklyTotals;
  },

  // Get week key for a date (year-week format)
  getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
  },

  // Get current week's hours
  getCurrentWeekHours() {
    const weeklyHours = this.getWeeklyHours();
    const currentWeekKey = this.getWeekKey(new Date());
    return weeklyHours[currentWeekKey] || 0;
  },

  // Check if adding hours would exceed weekly limit
  canAddHours(hours) {
    const profile = this.getProfile();
    const currentWeekHours = this.getCurrentWeekHours();
    const weeklyLimit = profile.weeklyHoursLimit || 10;
    return (currentWeekHours + hours) <= weeklyLimit;
  },

  // Get license requirements status
  getLicenseRequirements() {
    const stats = this.getStats();
    const profile = this.getProfile();

    const totalGoal = profile.licenseGoal || 60;
    const nightGoal = profile.nightHoursGoal || 10;
    const weeklyLimit = profile.weeklyHoursLimit || 10;

    const totalProgress = Math.min((stats.totalHours / totalGoal) * 100, 100);
    const nightProgress = Math.min((stats.nightHours / nightGoal) * 100, 100);
    const currentWeekHours = this.getCurrentWeekHours();
    const weeklyProgress = Math.min((currentWeekHours / weeklyLimit) * 100, 100);

    return {
      total: {
        current: stats.totalHours,
        goal: totalGoal,
        progress: totalProgress,
        met: stats.totalHours >= totalGoal
      },
      night: {
        current: stats.nightHours,
        goal: nightGoal,
        progress: nightProgress,
        met: stats.nightHours >= nightGoal
      },
      weekly: {
        current: currentWeekHours,
        limit: weeklyLimit,
        progress: weeklyProgress,
        remaining: Math.max(0, weeklyLimit - currentWeekHours)
      },
      allRequirementsMet: stats.totalHours >= totalGoal && stats.nightHours >= nightGoal
    };
  },

  // Export all data
  exportData() {
    return {
      drives: this.getDrives(),
      profile: this.getProfile(),
      checklist: this.getChecklist(),
      signature: this.getSignature(),
      exportedAt: new Date().toISOString()
    };
  },

  // Import data
  importData(data) {
    try {
      if (data.drives) this.saveDrives(data.drives);
      if (data.profile) this.saveProfile(data.profile);
      if (data.checklist) this.saveChecklist(data.checklist);
      if (data.signature) this.saveSignature(data.signature);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Validate drive data
  validateDrive(drive) {
    return drive &&
      typeof drive.duration === 'number' &&
      drive.duration > 0 &&
      drive.startTime &&
      drive.endTime;
  }
};
