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
     * Check current authentication status
     * Called on app initialization and when needed
     */
    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const userData = await AuthService.getCurrentUser();

            // Successfully got user data - user is authenticated
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            // Failed to get user data - user is not authenticated
            console.log('User not authenticated:', error.message);
            setUser(null);
            setIsAuthenticated(false);
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
                // Login successful - update state
                setUser(response.user);
                setIsAuthenticated(true);
                return response;
            } else {
                // Login failed - don't update state, let component handle error
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            // Login failed - ensure state is cleared
            setUser(null);
            setIsAuthenticated(false);
            throw error; // Re-throw for component to handle
        }
    };

    /**
     * Register new user
     * @param {string} fullName - User's full name
     * @param {string} studentId - Student ID
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Registration response
     */
    const register = async (fullName, studentId, email, password) => {
        try {
            const response = await AuthService.register(fullName, studentId, email, password);

            if (response.ok && response.user) {
                // Registration successful - update state (auto-login)
                setUser(response.user);
                setIsAuthenticated(true);
                return response;
            } else {
                // Registration failed - don't update state
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            // Registration failed - ensure state is cleared
            setUser(null);
            setIsAuthenticated(false);
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
        } catch (error) {
            // Even if API call fails, we should clear local state
            console.error('Logout API call failed:', error);
        } finally {
            // Always clear authentication state
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    /**
     * Handle automatic logout when authentication fails
     * Called by event listener or manually
     */
    const handleAutoLogout = () => {
        console.log('Auto-logout triggered');
        setUser(null);
        setIsAuthenticated(false);
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
    }, []);

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
