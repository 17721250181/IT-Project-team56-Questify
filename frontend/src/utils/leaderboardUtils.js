/**
 * Leaderboard Utility Functions
 * Helper functions for leaderboard display logic
 */

/**
 * Get the appropriate label for a time frame tab
 * @param {string} tab - Tab identifier
 * @returns {string} Display label
 */
export const getTabLabel = (tab) => {
    switch(tab) {
        case 'overall': return 'Overall';
        case 'daily': return 'Daily';
        case 'weekly': return 'Weekly';
        case 'monthly': return 'Monthly';
        default: return tab;
    }
};

/**
 * Get the Bootstrap icon class for a time frame tab
 * @param {string} tab - Tab identifier
 * @returns {string} Icon class name
 */
export const getTabIcon = (tab) => {
    switch(tab) {
        case 'overall': return 'bi-trophy';
        case 'daily': return 'bi-sun';
        case 'weekly': return 'bi-calendar-week';
        case 'monthly': return 'bi-calendar-month';
        default: return '';
    }
};

/**
 * Get rank badge/emoji for a given rank
 * @param {number} rank - User's rank position
 * @returns {string|number} Medal emoji for top 3, rank number otherwise
 */
export const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};

/**
 * Build query parameters for API request based on time frame
 * @param {string|null} timeFrame - Time frame filter (daily, weekly, monthly)
 * @returns {Object} Query parameters object
 */
export const buildTimeFrameParams = (timeFrame) => {
    const params = {};
    
    if (timeFrame) {
        const now = new Date();
        let fromDate;
        
        if (timeFrame === 'daily') {
            fromDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (timeFrame === 'weekly') {
            fromDate = new Date(now.setDate(now.getDate() - 7));
        } else if (timeFrame === 'monthly') {
            fromDate = new Date(now.setMonth(now.getMonth() - 1));
        }
        
        if (fromDate) {
            params.from = fromDate.toISOString().split('T')[0];
        }
    }
    
    return params;
};

/**
 * Map tab names to time frame filters
 * @param {string} activeTab - Active tab name
 * @returns {string|null} Time frame filter value
 */
export const getTimeFrameFromTab = (activeTab) => {
    const timeFrameMap = {
        'overall': null,
        'daily': 'daily',
        'weekly': 'weekly',
        'monthly': 'monthly'
    };
    
    return timeFrameMap[activeTab];
};
