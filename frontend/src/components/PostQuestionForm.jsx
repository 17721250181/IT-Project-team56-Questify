import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { QuestionService } from '../services/QuestionService.js';

const PostQuestionForm = () => {
    // Week and Topic options
    const weekTopicOptions = [
        { value: 'Week1 - JAVA basics', week: 'Week1', topic: 'JAVA basics' },
        { value: 'Week2 - Classes and Objects', week: 'Week2', topic: 'Classes and Objects' },
        { value: 'Week3 - Software Tools and Bagel', week: 'Week3', topic: 'Software Tools and Bagel' },
        { value: 'Week4 - Arrays and Strings', week: 'Week4', topic: 'Arrays and Strings' },
        { value: 'Week4 - Input and Output', week: 'Week4', topic: 'Input and Output' },
        { value: 'Week5 - Inheritance and Polymorphism', week: 'Week5', topic: 'Inheritance and Polymorphism' },
        { value: 'Week6 - Interfaces and Polymorphism', week: 'Week6', topic: 'Interfaces and Polymorphism' },
        { value: 'Week7 - Modelling Classes and Relationships', week: 'Week7', topic: 'Modelling Classes and Relationships' },
        { value: 'Week8 - Generics', week: 'Week8', topic: 'Generics' },
        { value: 'Week8 - Collections and Maps', week: 'Week8', topic: 'Collections and Maps' },
        { value: 'Week9 - Design Patterns', week: 'Week9', topic: 'Design Patterns' },
        { value: 'Week10 - Exceptions', week: 'Week10', topic: 'Exceptions' },
        { value: 'Week10 - Software Testing and Design', week: 'Week10', topic: 'Software Testing and Design' },
        { value: 'Week11 - Event Driven Programming', week: 'Week11', topic: 'Event Driven Programming' },
        { value: 'Week12 - Advanced Java', week: 'Week12', topic: 'Advanced Java' }
    ];

    const [formData, setFormData] = useState({
        question: '',
        type: 'SHORT',
        weekTopic: '',
        week: '',
        topic: '',
        answer: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_options: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            type: e.target.value,
            // Reset fields when switching types
            answer: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            option_e: '',
            correct_options: []
        }));
    };

    const handleWeekTopicChange = (e) => {
        const selectedValue = e.target.value;
        const selected = weekTopicOptions.find(opt => opt.value === selectedValue);
        
        setFormData(prev => ({
            ...prev,
            weekTopic: selectedValue,
            week: selected ? selected.week : '',
            topic: selected ? selected.topic : ''
        }));
    };

    const handleCorrectOptionChange = (option, isChecked) => {
        setFormData(prev => ({
            ...prev,
            correct_options: isChecked 
                ? [...prev.correct_options, option]
                : prev.correct_options.filter(opt => opt !== option)
        }));
        
        // Clear correct_options validation error
        if (validationErrors.correct_options) {
            setValidationErrors(prev => ({
                ...prev,
                correct_options: ''
            }));
        }
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};

        // Validate question text
        if (!formData.question.trim()) {
            errors.question = 'Question text is required';
        } else if (formData.question.trim().length < 10) {
            errors.question = 'Question must be at least 10 characters';
        }

        // Validate week and topic
        if (!formData.weekTopic) {
            errors.weekTopic = 'Please select a week and topic';
        }

        // Type-specific validation
        if (formData.type === 'SHORT') {
            if (!formData.answer.trim()) {
                errors.answer = 'Expected answer is required';
            }
        } else if (formData.type === 'MCQ') {
            // Validate options
            if (!formData.option_a.trim()) {
                errors.option_a = 'Option A is required';
            }
            if (!formData.option_b.trim()) {
                errors.option_b = 'Option B is required';
            }
            
            // Validate correct options
            if (formData.correct_options.length === 0) {
                errors.correct_options = 'Please select at least one correct option';
            }
            
            // Ensure selected correct options have text
            formData.correct_options.forEach(opt => {
                const optionKey = `option_${opt.toLowerCase()}`;
                if (!formData[optionKey]?.trim()) {
                    errors[optionKey] = `Option ${opt} cannot be empty if marked as correct`;
                }
            });
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            setError('Please fix the errors before submitting');
            return;
        }
        
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (formData.type === 'SHORT') {
                await QuestionService.createShortAnswerQuestion(
                    formData.question,
                    formData.answer,
                    formData.week,
                    formData.topic
                );
            } else if (formData.type === 'MCQ') {
                const options = {
                    A: formData.option_a,
                    B: formData.option_b,
                    C: formData.option_c,
                    D: formData.option_d,
                    E: formData.option_e
                };
                await QuestionService.createMCQQuestion(
                    formData.question,
                    options,
                    formData.correct_options,
                    formData.week,
                    formData.topic
                );
            }

            setMessage('Question created successfully!');
            // Reset form
            setFormData({
                question: '',
                type: 'SHORT',
                weekTopic: '',
                week: '',
                topic: '',
                answer: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                option_e: '',
                correct_options: []
            });
            setValidationErrors({});
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error creating question:', err);
            }
            setError('Failed to create question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h4 className="mb-4">Create New Question</h4>
            
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* Week and Topic Selection */}
                    <Form.Group className="mb-3">
                        <Form.Label>Week & Topic <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="weekTopic"
                            value={formData.weekTopic}
                            onChange={handleWeekTopicChange}
                            isInvalid={!!validationErrors.weekTopic}
                            required
                        >
                            <option value="">Select a week and topic...</option>
                            {weekTopicOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.value}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.weekTopic}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Question Text */}
                    <Form.Group className="mb-3">
                        <Form.Label>Question <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="question"
                            value={formData.question}
                            onChange={handleInputChange}
                            placeholder="Enter your question..."
                            isInvalid={!!validationErrors.question}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {validationErrors.question}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* Question Type */}
                    <Form.Group className="mb-3">
                        <Form.Label>Question Type</Form.Label>
                        <Form.Select
                            name="type"
                            value={formData.type}
                            onChange={handleTypeChange}
                        >
                            <option value="SHORT">Short Answer</option>
                            <option value="MCQ">Multiple Choice</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Short Answer Fields */}
                    {formData.type === 'SHORT' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Expected Answer <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="answer"
                                value={formData.answer}
                                onChange={handleInputChange}
                                placeholder="Enter the expected answer..."
                                isInvalid={!!validationErrors.answer}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.answer}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}

                    {/* Multiple Choice Fields */}
                    {formData.type === 'MCQ' && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Options (Check the correct answers) <span className="text-danger">*</span></Form.Label>
                                
                                {validationErrors.correct_options && (
                                    <div className="text-danger small mb-2">
                                        {validationErrors.correct_options}
                                    </div>
                                )}
                                
                                {/* Option A */}
                                <Row className="align-items-center mb-2">
                                    <Col md={10}>
                                        <Form.Control
                                            name="option_a"
                                            value={formData.option_a}
                                            onChange={handleInputChange}
                                            placeholder="Enter option A..."
                                            isInvalid={!!validationErrors.option_a}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.option_a}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="correct-a"
                                            label="Correct"
                                            checked={formData.correct_options.includes('A')}
                                            onChange={(e) => handleCorrectOptionChange('A', e.target.checked)}
                                        />
                                    </Col>
                                </Row>

                                {/* Option B */}
                                <Row className="align-items-center mb-2">
                                    <Col md={10}>
                                        <Form.Control
                                            name="option_b"
                                            value={formData.option_b}
                                            onChange={handleInputChange}
                                            placeholder="Enter option B..."
                                            isInvalid={!!validationErrors.option_b}
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.option_b}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="correct-b"
                                            label="Correct"
                                            checked={formData.correct_options.includes('B')}
                                            onChange={(e) => handleCorrectOptionChange('B', e.target.checked)}
                                        />
                                    </Col>
                                </Row>

                                {/* Option C */}
                                <Row className="align-items-center mb-2">
                                    <Col md={10}>
                                        <Form.Control
                                            name="option_c"
                                            value={formData.option_c}
                                            onChange={handleInputChange}
                                            placeholder="Enter option C..."
                                            required
                                        />
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="correct-c"
                                            label="Correct"
                                            checked={formData.correct_options.includes('C')}
                                            onChange={(e) => handleCorrectOptionChange('C', e.target.checked)}
                                        />
                                    </Col>
                                </Row>

                                {/* Option D */}
                                <Row className="align-items-center mb-2">
                                    <Col md={10}>
                                        <Form.Control
                                            name="option_d"
                                            value={formData.option_d}
                                            onChange={handleInputChange}
                                            placeholder="Enter option D..."
                                            required
                                        />
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="correct-d"
                                            label="Correct"
                                            checked={formData.correct_options.includes('D')}
                                            onChange={(e) => handleCorrectOptionChange('D', e.target.checked)}
                                        />
                                    </Col>
                                </Row>

                                {/* Option E */}
                                <Row className="align-items-center mb-2">
                                    <Col md={10}>
                                        <Form.Control
                                            name="option_e"
                                            value={formData.option_e}
                                            onChange={handleInputChange}
                                            placeholder="Enter option E..."
                                            required
                                        />
                                    </Col>
                                    <Col md={2} className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            id="correct-e"
                                            label="Correct"
                                            checked={formData.correct_options.includes('E')}
                                            onChange={(e) => handleCorrectOptionChange('E', e.target.checked)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                            
                            {/* Validation message */}
                            {formData.correct_options.length === 0 && (
                                <Alert variant="warning" className="mb-3">
                                    Please select at least one correct answer.
                                </Alert>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <div className="d-grid">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating Question...' : 'Create Question'}
                        </Button>
                    </div>
                </Form>
        </Container>
    );
};

export default PostQuestionForm;