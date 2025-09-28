/**
 * Simplified Cookie Service for Authentication
 * Handles basic cookie operations for user login state
 */
class CookieServiceAuth {
    // Cookie names
    static COOKIES = {
        IS_LOGGED_IN: 'questify_logged_in',
        USER_INFO: 'questify_user'
    };

    /**
     * Set a simple cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiry in days (default: 7)
     */
    static setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    }

    /**
     * Get cookie value
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
     * Delete a cookie
     * @param {string} name - Cookie name
     */
    static deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    static isLoggedIn() {
        return this.getCookie(this.COOKIES.IS_LOGGED_IN) === 'true';
    }

    /**
     * Save user login state
     * @param {Object} user - User object
     */
    static saveLogin(user) {
        this.setCookie(this.COOKIES.IS_LOGGED_IN, 'true');
        this.setCookie(this.COOKIES.USER_INFO, JSON.stringify({
            id: user.id,
            name: user.name || user.full_name,
            email: user.email,
            student_id: user.student_id
        }));
    }

    /**
     * Get saved user info
     * @returns {Object|null}
     */
    static getSavedUser() {
        const userInfo = this.getCookie(this.COOKIES.USER_INFO);
        if (userInfo) {
            try {
                return JSON.parse(userInfo);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Clear login state
     */
    static clearLogin() {
        this.deleteCookie(this.COOKIES.IS_LOGGED_IN);
        this.deleteCookie(this.COOKIES.USER_INFO);
    }
}

export default CookieServiceAuth;