import apiClient from './apiClient.js';

/**
 * Comment Service
 * Handles all comment-related API calls
 */
export const CommentService = {
    /**
     * Get all comments for a specific question
     * @param {string} questionId - UUID of the question
     * @returns {Promise<Array>} Array of comments
     */
    getComments: async (questionId) => {
        try {
            const response = await apiClient.get(`/questions/${questionId}/comments/`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch comments for question ${questionId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new comment on a question
     * @param {string} questionId - UUID of the question
     * @param {string} content - Comment content
     * @returns {Promise<Object>} Created comment object
     */
    createComment: async (questionId, content) => {
        try {
            const response = await apiClient.post(`/questions/${questionId}/comments/`, {
                content
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create comment:', error);
            throw error;
        }
    },

    /**
     * Reply to an existing comment
     * @param {string} commentId - UUID of the parent comment
     * @param {string} content - Reply content
     * @returns {Promise<Object>} Created reply object
     */
    replyToComment: async (commentId, content) => {
        try {
            const response = await apiClient.post(`/questions/comments/${commentId}/reply/`, {
                content
            });
            return response.data;
        } catch (error) {
            console.error('Failed to reply to comment:', error);
            throw error;
        }
    },

    /**
     * Like a comment
     * @param {string} commentId - UUID of the comment
     * @returns {Promise<Object>} Updated like count
     */
    likeComment: async (commentId) => {
        try {
            const response = await apiClient.post(`/questions/comments/${commentId}/like/`);
            return response.data;
        } catch (error) {
            console.error('Failed to like comment:', error);
            throw error;
        }
    },

    /**
     * Unlike a comment
     * @param {string} commentId - UUID of the comment
     * @returns {Promise<Object>} Updated like count
     */
    unlikeComment: async (commentId) => {
        try {
            const response = await apiClient.post(`/questions/comments/${commentId}/unlike/`);
            return response.data;
        } catch (error) {
            console.error('Failed to unlike comment:', error);
            throw error;
        }
    }
};
