import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../common/PasswordInput';
import ErrorMessage from '../common/ErrorMessage';

const RegisterForm = () => {
    // State variables for inputs
    const [formData, setFormData] = useState({
        displayName: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validation functions
    const validateForm = () => {
        const newErrors = {};

        // Display Name validation
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        } else if (formData.displayName.trim().length < 2) {
            newErrors.displayName = 'Display name must be at least 2 characters';
        }

        // Student ID validation
        if (!formData.studentId.trim()) {
            newErrors.studentId = 'Student ID is required';
        } else if (!/^\d{6,10}$/.test(formData.studentId.trim())) {
            newErrors.studentId = 'Student ID must be 6-10 digits';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (!formData.email.endsWith('@student.unimelb.edu.au')) {
            newErrors.email = 'Please use your University of Melbourne student email address (@student.unimelb.edu.au)';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await register(
                formData.displayName,
                formData.studentId,
                formData.email,
                formData.password
            );

            console.log('Registration successful:', response);
            setMessage('Registration successful! Redirecting to questions...');

            // Clear form
            setFormData({
                displayName: '',
                studentId: '',
                email: '',
                password: '',
                confirmPassword: '',
                agreeToTerms: false
            });

            // Redirect to questions after a short delay
            setTimeout(() => {
                navigate('/questions', { replace: true });
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-form-container">
            <Form className="login-form" onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                        Display Name
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="displayName"
                        placeholder="Choose how your name appears"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="form-input"
                        isInvalid={!!errors.displayName}
                        disabled={loading}
                    />
                    <ErrorMessage message={errors.displayName} />
                </Form.Group>

                {/* Student ID Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                        Student ID
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="studentId"
                        placeholder="Enter your student ID"
                        value={formData.studentId}
                        onChange={handleChange}
                        className="form-input"
                        isInvalid={!!errors.studentId}
                        disabled={loading}
                    />
                    <ErrorMessage message={errors.studentId} />
                </Form.Group>

                {/* Email Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                        Email Address
                    </Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        isInvalid={!!errors.email}
                        disabled={loading}
                    />
                    <ErrorMessage message={errors.email} />
                </Form.Group>

                {/* Password Field */}
                <PasswordInput
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password (min 8 characters)"
                    isInvalid={!!errors.password}
                    disabled={loading}
                    name="password"
                    label="Password"
                    feedbackText={errors.password}
                    required={false}
                    className="mb-3"
                />

                {/* Confirm Password Field */}
                <PasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    isInvalid={!!errors.confirmPassword}
                    disabled={loading}
                    name="confirmPassword"
                    label="Confirm Password"
                    feedbackText={errors.confirmPassword}
                    required={false}
                    className="mb-3"
                />

                {/* Terms Agreement */}
                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        isInvalid={!!errors.agreeToTerms}
                        disabled={loading}
                        label={
                            <span>
                                I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                            </span>
                        }
                    />
                    <ErrorMessage message={errors.agreeToTerms} />
                </Form.Group>

                {/* Primary Register Button */}
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
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </div>

                {/* Secondary Actions */}
                <div className="secondary-actions">
                    <div className="text-center">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="register-btn">
                            Sign In
                        </Link>
                    </div>
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

export default RegisterForm;
