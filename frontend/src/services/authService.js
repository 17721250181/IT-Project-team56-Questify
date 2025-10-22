import apiClient from './apiClient.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls and data transformations
 */
export const AuthService = {
    /**
     * User Login
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response with user data
     */
    login: async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login/', {
                email: email.trim().toLowerCase(),
                password: password
            });

            return response.data;
        } catch (error) {
            // Handle API errors
            if (error.response?.data) {
                const errorData = error.response.data;
                throw new Error(errorData.message || 'Login failed');
            }

            // Handle network errors
            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

            // Handle other errors
            throw new Error('Login failed - please try again');
        }
    },

    /**
     * User Registration
     * @param {string} displayName - Preferred display name
     * @param {string} studentId - Student ID
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<Object>} Registration response with user data
     */
    register: async (displayName, studentId, email, password) => {
        try {
            const response = await apiClient.post('/auth/register/', {
                display_name: displayName.trim(),         // Frontend 'displayName' → Backend field
                student_id: studentId.trim(),             // Frontend 'studentId' → Backend 'student_id'
                email: email.trim().toLowerCase(),
                password: password
            });

            return response.data;
        } catch (error) {
            // Handle API errors with validation details
            if (error.response?.data) {
                const errorData = error.response.data;

                // Handle validation errors (field-specific errors)
                if (errorData.errors && typeof errorData.errors === 'object') {
                    const errorMessages = [];

                    // Extract all error messages from different fields
                    Object.entries(errorData.errors).forEach(([, messages]) => {
                        if (Array.isArray(messages)) {
                            errorMessages.push(...messages);
                        } else if (typeof messages === 'string') {
                            errorMessages.push(messages);
                        }
                    });

                    if (errorMessages.length > 0) {
                        // Clean trailing punctuation from each message before joining
                        const cleanedMessages = errorMessages.map(msg =>
                            msg.trim().replace(/[.!?;]+$/, '')
                        );
                        throw new Error(cleanedMessages.join('; '));
                    }
                }

                // Handle general error message
                throw new Error(errorData.message || 'Registration failed');
            }

            // Handle network errors
            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

            // Handle other errors
            throw new Error('Registration failed - please try again');
        }
    },

    /**
     * Get Current User Information
     * @returns {Promise<Object>} Current user data
     */
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/me/');
            return response.data;
        } catch (error) {
            // Handle authentication errors specifically
            if (error.response?.status === 401) {
                throw new Error('Not authenticated');
            }

            if (error.response?.status === 403) {
                throw new Error('Access denied');
            }

            // Handle other API errors
            if (error.response?.data) {
                throw new Error(error.response.data.message || 'Failed to get user information');
            }

            // Handle network errors
            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

            // Handle other errors
            throw new Error('Failed to get user information');
        }
    },

    /**
     * Get user statistics including points and ranking from leaderboard
     * @returns {Promise<Object>} User statistics with points and ranking
     */
    getUserStats: async () => {
        try {
            const response = await apiClient.get('/leaderboard/me/');
            // API now returns flat structure: { points, rank, total_users, ... }
            return {
                points: response.data.points ?? 0,
                ranking: response.data.rank ?? null,
                total_users: response.data.total_users ?? 0
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch user stats:', error);
            }
            // Return default values if stats unavailable
            return {
                points: 0,
                ranking: null,
                total_users: 0
            };
        }
    },

    /**
     * User Logout
     * @returns {Promise<Object>} Logout response
     */
    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout/');
            return response.data;
        } catch (error) {
            // For logout, we should succeed even if the server call fails
            // This ensures the user can always log out locally
            if (import.meta.env.DEV) {
                console.error('Logout API call failed:', error);
            }

            return {
                ok: true,
                message: 'Logged out successfully'
            };
        }
    }
};
