import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
    // State variables for inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Hooks for authentication and navigation
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect to questions
    const redirectTo = '/questions';

    // Handle messages passed from other pages (e.g., password reset success)
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location.state]);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Basic validation
        if (!email.trim() || !password.trim()) {
            setMessage('Please enter both email and password');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            console.log('Attempting login for:', email);

            // Use AuthContext login method
            const response = await login(email, password);

            console.log('Login successful:', response);
            setMessage('Login successful! Redirecting...');

            // Redirect after short delay for user feedback
            setTimeout(() => {
                navigate(redirectTo, { replace: true });
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        disabled={loading}
                        required
                    />
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
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        disabled={loading}
                        required
                    />
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
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing In...
                            </>
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
