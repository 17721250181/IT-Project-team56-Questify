import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
    // State variables for inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // prevents page reload
        console.log('Email:', email);
        console.log('Password:', password);
        try {
            // Need update URL to actual login endpoint
            const response = await axios.post('/api/login', { email, password });
            setMessage(response.data.message);
        } catch (error) {
            console.error('There was an error!', error);
            setMessage('Login failed');
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
                    >
                        Sign In
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
                    <div className={`alert ${message.includes('failed') ? 'alert-danger' : 'alert-success'}`}>
                        {message}
                    </div>
                )}
            </Form>
        </div>
    );
};

export default LoginForm;
