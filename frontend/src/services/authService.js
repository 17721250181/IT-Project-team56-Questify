import apiClient, { CsrfService } from './apiClient.js';

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
                password
            });

            const data = response.data;
            if (data?.csrfToken) {
                CsrfService.setToken(data.csrfToken);
            }

            return data;
        } catch (error) {
            const token = error.response?.data?.csrfToken;
            if (token) {
                CsrfService.setToken(token);
            } else {
                CsrfService.clearToken();
            }

            // Handle API errors
            if (error.response?.data) {
                const errorData = error.response.data;
                throw new Error(errorData.message || 'Login failed');
            }

            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

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
                display_name: displayName.trim(),
                student_id: studentId.trim(),
                email: email.trim().toLowerCase(),
                password
            });

            const data = response.data;
            if (data?.csrfToken) {
                CsrfService.setToken(data.csrfToken);
            }
            return data;
        } catch (error) {
            const token = error.response?.data?.csrfToken;
            if (token) {
                CsrfService.setToken(token);
            } else {
                CsrfService.clearToken();
            }

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.errors && typeof errorData.errors === 'object') {
                    const errorMessages = [];

                    Object.entries(errorData.errors).forEach(([, messages]) => {
                        if (Array.isArray(messages)) {
                            errorMessages.push(...messages);
                        } else if (typeof messages === 'string') {
                            errorMessages.push(messages);
                        }
                    });

                    if (errorMessages.length > 0) {
                        const cleanedMessages = errorMessages.map((msg) =>
                            msg.trim().replace(/[.!?;]+$/, '')
                        );
                        throw new Error(cleanedMessages.join('; '));
                    }
                }

                throw new Error(errorData.message || 'Registration failed');
            }

            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

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
            const data = response.data;
            const token = data?.csrfToken;
            if (token) {
                CsrfService.setToken(token);
            }
            return data;
        } catch (error) {
            CsrfService.clearToken();

            if (error.response?.status === 401) {
                throw new Error('Not authenticated');
            }

            if (error.response?.status === 403) {
                throw new Error('Access denied');
            }

            if (error.response?.data) {
                throw new Error(error.response.data.message || 'Failed to get user information');
            }

            if (error.request) {
                throw new Error('Network error - please check your connection');
            }

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
            return {
                points: response.data.points ?? 0,
                ranking: response.data.rank ?? null,
                total_users: response.data.total_users ?? 0
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch user stats:', error);
            }
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
            const data = response.data;
            if (data?.csrfToken) {
                CsrfService.setToken(data.csrfToken);
            } else {
                CsrfService.clearToken();
            }
            return data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Logout API call failed:', error);
            }

            CsrfService.clearToken();

            return {
                ok: true,
                message: 'Logged out successfully'
            };
        }
    }
};
