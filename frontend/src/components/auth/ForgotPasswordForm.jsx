import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        // Basic validation
        if (!email.trim()) {
            setError('Email address is required');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Placeholder API call - replace with actual backend integration
            console.log('Password reset requested for:', email);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage('Password reset link sent to your email! Check your inbox and follow the instructions.');
            setEmail(''); // Clear the form
        } catch (error) {
            console.error('Password reset error:', error);
            setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-form-container">
            <Form className="forgot-password-form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                    <Form.Label className="form-label">
                        Email Address
                    </Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control"
                        disabled={loading}
                        required
                    />
                </Form.Group>

                {/* Send Reset Link Button */}
                <div className="d-grid mb-4">
                    <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="forgot-password-btn"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </div>

                {/* Back to Login Link */}
                <div className="text-center mb-3">
                    <Link to="/login" className="back-to-login-link">
                        ← Back to Login
                    </Link>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}
            </Form>
        </div>
    );
};

export default ForgotPasswordForm;