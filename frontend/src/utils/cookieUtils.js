const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || 'csrftoken';

/**
 * Universal Cookie Utilities
 * Provides basic cookie operations for the entire application
 */
class CookieUtils {
    /**
     * Get cookie value by name
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null
     */
    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    /**
     * Set a cookie with specified options
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {Object} options - Cookie options
     */
    static setCookie(name, value, options = {}) {
        const {
            days = 7,
            path = '/'
        } = options;

        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}`;
    }

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     * @param {string} path - Cookie path (default: '/')
     */
    static deleteCookie(name, path = '/') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }

    /**
     * Get CSRF token from cookies (commonly used)
     * @returns {string|null} CSRF token or null
     */
    static getCSRFToken() {
        return this.getCookie(CSRF_COOKIE_NAME);
    }
}

export { CSRF_COOKIE_NAME };
export default CookieUtils;
