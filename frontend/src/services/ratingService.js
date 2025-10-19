import apiClient from './apiClient.js';

/**
 * Rating Service
 * Handles all question rating-related API calls
 */
export const RatingService = {
    /**
     * Get rating information for a specific question
     * @param {string} questionId - UUID of the question
     * @returns {Promise<Object>} Rating data including average, count, and user's rating
     */
    getQuestionRating: async (questionId) => {
        try {
            const response = await apiClient.get(`/questions/${questionId}/rating/`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch rating for question ${questionId}:`, error);
            throw error;
        }
    },

    /**
     * Submit a rating for a question
     * @param {string} questionId - UUID of the question
     * @param {number} score - Rating score (1-5)
     * @returns {Promise<Object>} Updated rating data
     */
    rateQuestion: async (questionId, score) => {
        try {
            const response = await apiClient.post(`/questions/${questionId}/rating/`, { score });
            return response.data;
        } catch (error) {
            console.error(`Failed to rate question ${questionId}:`, error);
            throw error;
        }
    },

    /**
     * Remove user's rating from a question
     * @param {string} questionId - UUID of the question
     * @returns {Promise<void>}
     */
    clearRating: async (questionId) => {
        try {
            await apiClient.delete(`/questions/${questionId}/rating/`);
        } catch (error) {
            console.error(`Failed to remove rating for question ${questionId}:`, error);
            throw error;
        }
    },
};
