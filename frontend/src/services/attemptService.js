import apiClient from './apiClient.js';

/**
 * Attempt Service
 * API methods for question attempts
 */
export const AttemptService = {
    /**
     * Get all attempts by the current user
     * @returns {Promise<Array>} List of attempts
     */
    getUserAttempts: async () => {
        try {
            const response = await apiClient.get('/attempts/user/');
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch user attempts:', error);
            }
            throw error;
        }
    },

    /**
     * Get all attempts for a specific question (all users)
     * @param {string} questionId - Question UUID
     * @returns {Promise<Array>} List of attempts for the question
     */
    getQuestionAttempts: async (questionId) => {
        try {
            const response = await apiClient.get(`/attempts/question/${questionId}/`);
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(`Failed to fetch attempts for question ${questionId}:`, error);
            }
            throw error;
        }
    },

    /**
     * Get current user's attempts for a specific question
     * @param {string} questionId - Question UUID
     * @returns {Promise<Array>} List of current user's attempts for the question
     */
    getUserQuestionAttempts: async (questionId) => {
        try {
            const response = await apiClient.get(`/attempts/user/question/${questionId}/`);
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(`Failed to fetch user attempts for question ${questionId}:`, error);
            }
            throw error;
        }
    },

    /**
     * Create a new attempt
     * @param {string} questionId - Question UUID
     * @param {string|Array} answer - User's answer
     * @returns {Promise<Object>} Created attempt data
     */
    createAttempt: async (questionId, answer) => {
        try {
            const response = await apiClient.post('/attempts/create/', {
                question: questionId,
                answer: answer
            });
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to create attempt:', error);
            }
            throw error;
        }
    },

    /**
     * Get user's activity heatmap data
     * @returns {Promise<Object>} Activity data for heatmap
     */
    getUserActivityHeatmap: async () => {
        try {
            if (import.meta.env.DEV) {
                console.log('Fetching user activity heatmap data...');
            }
            const response = await apiClient.get('/attempts/user/activity/');
            if (import.meta.env.DEV) {
                console.log('Activity heatmap data fetched');
            }
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch activity heatmap:', error);
            }
            throw new Error('Failed to fetch activity data');
        }
    }
};
