import CookieUtils from '../utils/cookieUtils.js';

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
     * Check if user is logged in
     * @returns {boolean}
     */
    static isLoggedIn() {
        return CookieUtils.getCookie(this.COOKIES.IS_LOGGED_IN) === 'true';
    }

    /**
     * Save user login state
     * @param {Object} user - User object
     */
    static saveLogin(user) {
        CookieUtils.setCookie(this.COOKIES.IS_LOGGED_IN, 'true');
        CookieUtils.setCookie(this.COOKIES.USER_INFO, JSON.stringify({
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
        const userInfo = CookieUtils.getCookie(this.COOKIES.USER_INFO);
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
        CookieUtils.deleteCookie(this.COOKIES.IS_LOGGED_IN);
        CookieUtils.deleteCookie(this.COOKIES.USER_INFO);
    }
}

export default CookieServiceAuth;