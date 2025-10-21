import React from 'react';

/**
 * LoadingSpinner Component
 * Reusable loading spinner with optional text
 * 
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} text - Optional loading text to display
 * @param {boolean} fullScreen - Whether to display as full-screen overlay
 * @param {string} variant - Bootstrap color variant (default: 'primary')
 */
const LoadingSpinner = ({ 
    size = 'md', 
    text = 'Loading...', 
    fullScreen = false,
    variant = 'primary'
}) => {
    const sizeClass = {
        'sm': 'spinner-border-sm',
        'md': '',
        'lg': 'spinner-border spinner-border-lg'
    }[size] || '';

    const spinner = (
        <div className="text-center">
            <div className={`spinner-border text-${variant} ${sizeClass}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            {text && <div className="mt-2">{text}</div>}
        </div>
    );

    if (fullScreen) {
        return (
            <div 
                className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                style={{ zIndex: 9999 }}
            >
                {spinner}
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center p-5">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
