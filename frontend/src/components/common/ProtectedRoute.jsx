import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

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

    // Show loading spinner while authentication status is being checked
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <LoadingSpinner size="lg" text="Checking authentication..." />
            </div>
        );
    }

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated - render the protected content
    return children;
};

export default ProtectedRoute;
