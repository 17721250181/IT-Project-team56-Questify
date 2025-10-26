import axios from 'axios';
import CookieUtils, { CSRF_COOKIE_NAME } from '../utils/cookieUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const UNSAFE_METHODS = ['post', 'put', 'patch', 'delete'];

let inMemoryCsrfToken = CookieUtils.getCSRFToken();
let pendingCsrfRequest = null;

/**
 * Create axios instance with base configuration
 * Handles JSON APIs with credentialled requests (session cookies)
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Lightweight client used to bootstrap CSRF tokens without
 * triggering the interceptors on the main instance.
 */
const bootstrapClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

const extractCsrfFromPayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    if (typeof payload.csrfToken === 'string' && payload.csrfToken.trim().length > 0) {
        return payload.csrfToken;
    }
    return null;
};

const fetchCsrfToken = async () => {
    const response = await bootstrapClient.get('/csrf/');
    const tokenFromBody = extractCsrfFromPayload(response.data);
    const tokenFromCookie = CookieUtils.getCookie(CSRF_COOKIE_NAME);
    const token = tokenFromBody || tokenFromCookie;

    if (!token) {
        throw new Error('Unable to retrieve CSRF token from backend response');
    }

    inMemoryCsrfToken = token;
    return token;
};

const ensureCsrfToken = async () => {
    if (inMemoryCsrfToken) {
        return inMemoryCsrfToken;
    }

    const cookieToken = CookieUtils.getCSRFToken();
    if (cookieToken) {
        inMemoryCsrfToken = cookieToken;
        return cookieToken;
    }

    if (!pendingCsrfRequest) {
        pendingCsrfRequest = fetchCsrfToken().finally(() => {
            pendingCsrfRequest = null;
        });
    }

    return pendingCsrfRequest;
};

const setCsrfToken = (token) => {
    if (typeof token === 'string' && token.trim().length > 0) {
        inMemoryCsrfToken = token;
    }
};

const clearCsrfToken = () => {
    inMemoryCsrfToken = null;
};

const peekCsrfToken = () => inMemoryCsrfToken || CookieUtils.getCSRFToken();

export const CsrfService = {
    ensureToken: ensureCsrfToken,
    setToken: setCsrfToken,
    clearToken: clearCsrfToken,
    peekToken: peekCsrfToken
};

/**
 * Request interceptor to guarantee CSRF header is present for unsafe methods.
 */
apiClient.interceptors.request.use(
    async (config) => {
        const method = (config.method || 'get').toLowerCase();

        if (UNSAFE_METHODS.includes(method)) {
            let token =
                (config.headers && (config.headers['X-CSRFToken'] || config.headers['x-csrftoken'])) ||
                peekCsrfToken();

            if (!token) {
                try {
                    token = await ensureCsrfToken();
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('Failed to prefetch CSRF token before request:', error);
                    }
                }
            }

            if (token) {
                if (config.headers && typeof config.headers.set === 'function') {
                    config.headers.set('X-CSRFToken', token);
                } else {
                    config.headers = config.headers || {};
                    config.headers['X-CSRFToken'] = token;
                }
            }
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('Request configuration error:', error);
        }
        return Promise.reject(error);
    }
);

/**
 * Response interceptor to handle token refresh, auth errors, and logging.
 */
apiClient.interceptors.response.use(
    (response) => {
        const token = extractCsrfFromPayload(response.data);
        if (token) {
            setCsrfToken(token);
        }
        return response;
    },
    (error) => {
        const statusCode = error.response?.status;
        const payload = error.response?.data;
        const token = extractCsrfFromPayload(payload);

        if (token) {
            setCsrfToken(token);
        } else if (statusCode === 403) {
            // Force refresh on next request if CSRF rejected
            clearCsrfToken();
        }

        if (statusCode === 401) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        if (import.meta.env.DEV) {
            if (error.response) {
                console.error('API Error:', {
                    status: statusCode,
                    statusText: error.response.statusText,
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    data: payload
                });
            } else if (error.request) {
                console.error('Network Error:', error.message);
            } else {
                console.error('Request Setup Error:', error.message);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
