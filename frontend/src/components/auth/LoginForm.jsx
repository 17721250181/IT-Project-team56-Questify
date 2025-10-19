import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
    // State variables for inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    // Hooks for authentication and navigation
    const { login } = useAuth();
    const location = useLocation();

    // Handle messages passed from other pages (e.g., password reset success)
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location.state]);

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle email change with validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        if (value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    // Handle password change with validation
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        
        if (value && value.length < 6) {
            setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Clear previous messages
        setMessage('');

        // Basic validation
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }
        
        if (!password.trim()) {
            setErrors(prev => ({ ...prev, password: 'Password is required' }));
            return;
        }

        if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
            return;
        }

        // Check if there are any validation errors
        if (errors.email || errors.password) {
            return;
        }

        setLoading(true);

        try {
            if (import.meta.env.DEV) {
                console.log('Attempting login for:', email);
            }

            // Use AuthContext login method
            await login(email, password);

            if (import.meta.env.DEV) {
                console.log('Login successful');
            }
            // Note: PublicRoute will automatically redirect to home page
            // once isAuthenticated becomes true, so no manual navigation needed

        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Login error:', error);
            }
            setMessage(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-form-container">
            <Form className="login-form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                        Email Address
                    </Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={handleEmailChange}
                        className="form-input"
                        disabled={loading}
                        isInvalid={!!errors.email}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4">
                    <Form.Label className="form-label">
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="form-input"
                        disabled={loading}
                        isInvalid={!!errors.password}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.password}
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Primary Login Button */}
                <div className="d-grid mb-3">
                    <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="d-flex align-items-center justify-content-center">
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </div>

                {/* Secondary Actions */}
                <div className="secondary-actions">
                    <div className="d-grid mb-2">
                        <Button
                            as={Link}
                            to="/register"
                            variant="outline-primary"
                            className="register-btn"
                            disabled={loading}
                        >
                            Create New Account
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/forgot-password"
                            className="forgot-password-link"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`alert ${message.includes('failed') || message.includes('error') || message.includes('Please enter')
                        ? 'alert-danger'
                        : 'alert-success'
                        }`}>
                        {message}
                    </div>
                )}
            </Form>
        </div>
    );
};

export default LoginForm;
