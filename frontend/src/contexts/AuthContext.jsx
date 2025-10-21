import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

/**
 * Authentication Context
 * Provides global authentication state and methods to the entire application
 */
const AuthContext = createContext(undefined);

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state and methods
 */
export const AuthProvider = ({ children }) => {
    // Authentication state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    /**
     * Update auth state
     * @param {Object|null} userData - User data or null to clear
     */
    const updateAuthState = (userData) => {
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('User authenticated via Django Session');
        } else {
            setUser(null);
            setIsAuthenticated(false);
            console.log('User logged out, session cleared');
        }
    };

    /**
     * Check current authentication status via Django Session
     */
    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            
            // Get user data directly from Django Session
            const userData = await AuthService.getCurrentUser();
            updateAuthState(userData);
            console.log('Django Session authenticated');
        } catch (error) {
            // Session invalid or expired
            console.log('Not authenticated:', error.message);
            updateAuthState(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response
     */
    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);

            if (response.ok && response.user) {
                // Login successful - update state and save to cookies
                updateAuthState(response.user);
                console.log('Login successful, saved to cookies');
                return response;
            } else {
                // Login failed - don't update state, let component handle error
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            // Login failed - ensure state and cookies are cleared
            updateAuthState(null);
            throw error; // Re-throw for component to handle
        }
    };

    /**
     * Register new user
     * @param {string} displayName - Preferred display name
     * @param {string} studentId - Student ID
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Registration response
     */
    const register = async (displayName, studentId, email, password) => {
        try {
            const response = await AuthService.register(displayName, studentId, email, password);

            if (response.ok && response.user) {
                // Registration successful - update state and save to cookies (auto-login)
                updateAuthState(response.user);
                console.log('Registration successful, user auto-logged in');
                return response;
            } else {
                // Registration failed - don't update state
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            // Registration failed - ensure state and cookies are cleared
            updateAuthState(null);
            throw error; // Re-throw for component to handle
        }
    };

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            // Call logout API
            await AuthService.logout();
            console.log('Server logout successful');
        } catch (error) {
            // Even if API call fails, we should clear local state
            console.error('Logout API call failed:', error);
        } finally {
            // Always clear authentication state and cookies
            updateAuthState(null);
            console.log('Authentication state and cookies cleared');
        }
    };

    /**
     * Handle automatic logout when authentication fails
     * Called by event listener or manually
     */
    const handleAutoLogout = () => {
        console.log('Auto-logout triggered - clearing authentication state and cookies');
        updateAuthState(null);
    };

    // Initialize authentication state on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Listen for unauthorized events from apiClient
    useEffect(() => {
        const handleUnauthorized = () => {
            handleAutoLogout();
        };

        // Listen for the custom event from apiClient
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // We want this to run only once on mount

    // Note: Cross-tab sync is handled by Django Session automatically
    // When one tab logs out, the sessionid cookie is cleared for all tabs
    // When another tab tries to make a request, it will get 401 and trigger logout

    // Context value object
    const contextValue = {
        // State
        user,
        isAuthenticated,
        loading,

        // Methods
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
