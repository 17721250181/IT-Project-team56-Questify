import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
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
        <Form className="p-2" onSubmit={handleSubmit}>
            <Form.Group align="left" controlId="formEmail" className="p-2">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </Form.Group>
            <Form.Group align="left" controlId="formPassword" className="p-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Group>
            <Button variant="primary" type="submit" className="m-2">
                Login
            </Button>
            {message && <p className="m-2">{message}</p>}
        </Form>
    );
};

export default LoginForm;
