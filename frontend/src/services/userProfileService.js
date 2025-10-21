import apiClient from './apiClient.js';

/**
 * User Profile Service
 * Handles all user profile-related API calls including profile pictures and user data
 */
export const UserProfileService = {
    /**
     * Get current user's profile picture URL
     * @returns {Promise<Object>} Profile picture data with URL
     */
    getProfilePicture: async () => {
        try {
            const response = await apiClient.get("/me/profile-picture/");
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("API error:", error);
            }
            throw new Error("Failed to fetch profile picture");
        }
    },

    /**
     * Set/Update current user's profile picture
     * @param {FormData} formData - Form data containing the profile_picture file
     * @returns {Promise<Object>} Updated profile picture data with URL
     */
    setProfilePicture: async (formData) => {
        try {
            const res = await apiClient.patch("me/profile-picture/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("API error:", error);
            }
            throw new Error("Failed to set profile picture");
        }
    },

    /**
     * Update current user's profile information
     * @param {Object} payload - Profile data to update (e.g., { display_name: "New Name" })
     * @returns {Promise<Object>} Updated user data
     */
    updateProfile: async (payload) => {
        try {
            const response = await apiClient.patch('/me/', payload);
            return response.data;
        } catch (error) {
            if (error.response?.data) {
                const message = error.response.data.message || 'Failed to update profile';
                throw new Error(message);
            }
            throw new Error('Failed to update profile');
        }
    },

    /**
     * Get user information by user ID
     * @param {number|string} userId - The ID of the user to fetch
     * @returns {Promise<Object>} User data including profile information
     */
    getUserById: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}/`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to load user profile');
        }
    }
};
