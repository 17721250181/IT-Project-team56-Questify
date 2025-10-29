import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import ErrorMessage from './ErrorMessage';
import '../../styles/PasswordInput.css';

/**
 * PasswordInput Component
 * Reusable password input field with visibility toggle icon inside the input
 *
 * @param {string} value - Current password value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} isInvalid - Whether the input has validation errors
 * @param {boolean} disabled - Whether the input is disabled
 * @param {string} name - Input name attribute
 * @param {string} label - Label text for the input
 * @param {string} feedbackText - Error feedback text
 * @param {boolean} required - Whether the input is required
 * @param {string} className - Additional CSS classes for the Form.Group
 */
const PasswordInput = ({
    value,
    onChange,
    placeholder = 'Enter password',
    isInvalid = false,
    disabled = false,
    name = 'password',
    label = 'Password',
    feedbackText = '',
    required = false,
    className = 'mb-3'
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Form.Group className={className}>
            <Form.Label className="form-label">
                {label}
            </Form.Label>
            <div className="password-input-wrapper">
                <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="form-input password-input-field"
                    isInvalid={isInvalid}
                    disabled={disabled}
                    required={required}
                />
                <span
                    className={`password-toggle-icon ${disabled ? 'disabled' : ''}`}
                    onClick={disabled ? undefined : togglePasswordVisibility}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onKeyDown={(e) => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            togglePasswordVisibility();
                        }
                    }}
                >
                    <i className={showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'}></i>
                </span>
            </div>
            <ErrorMessage message={isInvalid ? feedbackText : ''} />
        </Form.Group>
    );
};

export default PasswordInput;
