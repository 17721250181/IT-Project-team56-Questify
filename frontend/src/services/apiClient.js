import axios from 'axios';

/**
 * Unified API Client for Questify
 * Handles all HTTP requests with automatic CSRF token management
 */

// Create axios instance with base configuration
const apiClient = axios.create({
    // Standardize base to include /api so service paths don't need the prefix
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000, // 10 second timeout
    withCredentials: true, // Include cookies for Django sessions
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Extract CSRF token from cookies
 * Django sets csrftoken cookie automatically
 */
function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

/**
 * Request interceptor
 * Automatically adds CSRF token to unsafe HTTP methods
 */
apiClient.interceptors.request.use(
    (config) => {
        const method = (config.method || 'get').toLowerCase();
        const unsafeMethods = ['post', 'put', 'patch', 'delete'];

        // Add CSRF token for unsafe methods
        if (unsafeMethods.includes(method)) {
            const csrfToken = getCsrfToken();
            if (csrfToken && !config.headers['X-CSRFToken']) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        console.error('Request configuration error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * Handles common errors and authentication issues
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Log error details for debugging
        if (error.response) {
            console.error('API Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                data: error.response.data
            });
        } else if (error.request) {
            console.error('Network Error:', error.message);
        } else {
            console.error('Request Setup Error:', error.message);
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
            console.warn('Authentication required - user may need to login');
            // Trigger logout event for AuthContext to handle
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        if (error.response?.status === 403) {
            console.warn('Access forbidden - possible CSRF or permission issue');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
