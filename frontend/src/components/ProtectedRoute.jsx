import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Renders children only if user is authenticated, otherwise redirects to login
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if authenticated
 * @returns {React.ReactElement} Protected content, loading state, or redirect
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while authentication status is being checked
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-3">
                        <p className="text-muted">Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login page
    // Save the current location so user can be redirected back after login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // User is authenticated - render the protected content
    return children;
};

export default ProtectedRoute;
