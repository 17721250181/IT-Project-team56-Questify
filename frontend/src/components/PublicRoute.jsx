import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Public Route Component
 * Redirects authenticated users away from public pages (login, register)
 * Renders children only if user is NOT authenticated
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if not authenticated
 * @returns {React.ReactElement} Public content, loading state, or redirect
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

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

    // If already authenticated, redirect to home page
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // User is not authenticated - render the public content
    return children;
};

export default PublicRoute;
