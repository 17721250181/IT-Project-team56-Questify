import apiClient from './apiClient';
import { buildTimeFrameParams } from '../utils/leaderboardUtils';

/**
 * Leaderboard Service
 * Handles all leaderboard-related API calls
 */
export const LeaderboardService = {
    /**
     * Fetch full leaderboard with optional time filtering
     * @param {string|null} timeFrame - Time frame filter (daily, weekly, monthly, or null for overall)
     * @returns {Promise<Object>} Leaderboard data with pagination
     */
    getLeaderboard: async (timeFrame = null) => {
        try {
            const params = buildTimeFrameParams(timeFrame);
            const response = await apiClient.get('/leaderboard/', { params });
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch leaderboard:', error);
            }
            throw error;
        }
    },

    /**
     * Fetch current user's rank and surrounding users
     * @param {string|null} timeFrame - Time frame filter (daily, weekly, monthly, or null for overall)
     * @returns {Promise<Object>} User's rank data
     */
    getMyRank: async (timeFrame = null) => {
        try {
            const params = buildTimeFrameParams(timeFrame);
            const response = await apiClient.get('/leaderboard/me/', { params });
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch user rank:', error);
            }
            throw error;
        }
    },

    /**
     * Fetch both leaderboard and user rank in parallel
     * @param {string|null} timeFrame - Time frame filter
     * @returns {Promise<Object>} Object containing both leaderboard and myRank data
     */
    fetchLeaderboardData: async (timeFrame = null) => {
        try {
            const [leaderboardData, myRankData] = await Promise.all([
                LeaderboardService.getLeaderboard(timeFrame),
                LeaderboardService.getMyRank(timeFrame)
            ]);

            return {
                leaderboard: leaderboardData.results || [],
                myRank: myRankData,
                pagination: {
                    count: leaderboardData.count,
                    next: leaderboardData.next,
                    previous: leaderboardData.previous
                }
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch leaderboard data:', error);
            }
            throw error;
        }
    }
};

export default LeaderboardService;
