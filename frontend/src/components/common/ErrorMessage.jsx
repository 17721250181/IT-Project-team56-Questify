import React from 'react';
import '../../styles/ErrorMessage.css';

/**
 * ErrorMessage Component
 * Reusable error message display with icon and styled background
 *
 * @param {string} message - Error message text to display
 * @param {string} className - Additional CSS classes (optional)
 */
const ErrorMessage = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <div className={`error-message ${className}`}>
            <i className="bi bi-exclamation-circle"></i>
            <span>{message}</span>
        </div>
    );
};

export default ErrorMessage;
