import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { AuthService } from '../../services/authService';

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    
    // Form state
    const [step, setStep] = useState(1); // 1: email, 2: code & password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI state
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Handle email submission - request verification code
    const handleRequestCode = async (event) => {
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
            await AuthService.requestPasswordReset(email);
            setMessage('Verification code sent! Please check your email.');
            setStep(2);
            
            // Start countdown timer (can resend after 60 seconds)
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (err) {
            setError(err.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    // Handle resend code
    const handleResendCode = async () => {
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await AuthService.requestPasswordReset(email);
            setMessage('Verification code resent! Please check your email.');
            
            // Restart countdown
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
        } catch (err) {
            setError(err.message || 'Failed to resend verification code');
        } finally {
            setLoading(false);
        }
    };

    // Handle password reset with code
    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        // Validation
        if (!code.trim()) {
            setError('Please enter the verification code');
            return;
        }

        if (!newPassword) {
            setError('Please enter a new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await AuthService.resetPassword(email, code, newPassword);
            setMessage('Password reset successful! Redirecting to login...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Handle back button
    const handleBack = () => {
        setStep(1);
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setMessage('');
    };

    return (
        <div className="forgot-password-form-container">
            {/* Success Message */}
            {message && (
                <div className="alert alert-success mb-3">
                    {message}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger mb-3">
                    {error}
                </div>
            )}

            {step === 1 ? (
                // Step 1: Email input form
                <Form className="forgot-password-form" onSubmit={handleRequestCode}>
                    <p className="text-muted mb-4">
                        Enter your email address and we'll send you a verification code to reset your password.
                    </p>

                    {/* Email Field */}
                    <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                            Email Address
                        </Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="your.email@student.unimelb.edu.au"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            disabled={loading}
                            required
                        />
                    </Form.Group>

                    {/* Send Code Button */}
                    <div className="d-grid mb-4">
                        <Button
                            variant="primary"
                            type="submit"
                            size="lg"
                            className="forgot-password-btn"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </Button>
                    </div>

                    {/* Back to Login Link */}
                    <div className="text-center">
                        <Link to="/login" className="back-to-login-link">
                            ← Back to Login
                        </Link>
                    </div>
                </Form>
            ) : (
                // Step 2: Code and new password input form
                <Form className="forgot-password-form" onSubmit={handleResetPassword}>
                    <p className="text-muted mb-4">
                        Enter the 6-digit verification code sent to <strong>{email}</strong>
                    </p>

                    {/* Verification Code Field */}
                    <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                            Verification Code
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="form-control"
                            disabled={loading}
                            maxLength={6}
                            required
                        />
                        <Form.Text className="text-muted">
                            Code expires in 10 minutes
                        </Form.Text>
                    </Form.Group>

                    {/* New Password Field */}
                    <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                            New Password
                        </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-control"
                            disabled={loading}
                            required
                        />
                        <Form.Text className="text-muted">
                            Must be at least 8 characters
                        </Form.Text>
                    </Form.Group>

                    {/* Confirm Password Field */}
                    <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                            Confirm Password
                        </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control"
                            disabled={loading}
                            required
                        />
                    </Form.Group>

                    {/* Reset Password Button */}
                    <div className="d-grid mb-3">
                        <Button
                            variant="primary"
                            type="submit"
                            size="lg"
                            className="forgot-password-btn"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>

                    {/* Additional Actions */}
                    <div className="d-flex justify-content-between align-items-center">
                        <Button
                            variant="link"
                            onClick={handleBack}
                            disabled={loading}
                            className="p-0 back-to-login-link"
                        >
                            ← Change Email
                        </Button>
                        
                        {countdown > 0 ? (
                            <span className="text-muted small">
                                Resend code in {countdown}s
                            </span>
                        ) : (
                            <Button
                                variant="link"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="p-0 small"
                            >
                                Resend Code
                            </Button>
                        )}
                    </div>
                </Form>
            )}
        </div>
    );
};

export default ForgotPasswordForm;