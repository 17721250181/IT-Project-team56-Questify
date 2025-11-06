import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

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
    const { isAuthenticated, loading, isAdmin } = useAuth();

    // Show loading spinner while authentication status is being checked
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <LoadingSpinner size="lg" text="Checking authentication..." />
            </div>
        );
    }

    // If already authenticated, redirect to home page
    if (isAuthenticated) {
        const target = isAdmin ? '/admin' : '/';
        return <Navigate to={target} replace />;
    }

    // User is not authenticated - render the public content
    return children;
};

export default PublicRoute;
