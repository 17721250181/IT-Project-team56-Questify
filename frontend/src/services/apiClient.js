import axios from 'axios';
import CookieUtils from '../utils/cookieUtils.js';

/**
 * Unified API Client for Questify
 * Handles all HTTP requests with automatic CSRF token management
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const unsafeMethods = new Set(['post', 'put', 'patch', 'delete']);
let csrfTokenCache = CookieUtils.getCSRFToken();
let csrfFetchPromise = null;

const buildApiUrl = (path = '') => {
    const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${normalizedBase}${normalizedPath}`;
};

const ensureHeadersMutable = (headers) => {
    if (!headers) {
        return {};
    }
    return headers;
};

const fetchCsrfToken = async () => {
    if (csrfTokenCache) {
        return csrfTokenCache;
    }

    if (!csrfFetchPromise) {
        const url = buildApiUrl('/csrf/');

        csrfFetchPromise = fetch(url, {
            method: 'GET',
            credentials: 'include',
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch CSRF token: ${response.status}`);
                }
                const data = await response.json();
                const token = data?.csrfToken ?? null;
                csrfTokenCache = token;
                return token;
            })
            .catch((error) => {
                console.error('Failed to refresh CSRF token', error);
                throw error;
            })
            .finally(() => {
                csrfFetchPromise = null;
            });
    }

    return csrfFetchPromise;
};

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 second timeout
    withCredentials: true, // Include cookies for Django sessions
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor
 * Automatically adds CSRF token to unsafe HTTP methods
 */
apiClient.interceptors.request.use(
    async (config) => {
        const method = (config.method || 'get').toLowerCase();
        const headers = ensureHeadersMutable(config.headers);

        const existingHeader =
            (typeof headers.get === 'function' && headers.get('X-CSRFToken')) ||
            headers['X-CSRFToken'] ||
            headers['x-csrftoken'];

        if (unsafeMethods.has(method) && !existingHeader) {
            let csrfToken = CookieUtils.getCSRFToken() || csrfTokenCache;
            if (!csrfToken) {
                try {
                    csrfToken = await fetchCsrfToken();
                } catch (error) {
                    console.warn('Unable to obtain CSRF token before request', error);
                }
            }

            if (csrfToken) {
                if (typeof headers.set === 'function') {
                    headers.set('X-CSRFToken', csrfToken);
                } else {
                    headers['X-CSRFToken'] = csrfToken;
                }
                csrfTokenCache = csrfToken;
            }
        }

        config.headers = headers;
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
                data: error.response.data,
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
            csrfTokenCache = null;
        }

        return Promise.reject(error);
    }
);

export default apiClient;
