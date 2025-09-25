import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { QuestionService } from '../services/questionService.js';

const PostQuestionForm = () => {
    const [formData, setFormData] = useState({
        question: '',
        type: 'SHORT',
        answer: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_option: 'A'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            correct_option: 'A'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (formData.type === 'SHORT') {
                await QuestionService.createShortAnswerQuestion(
                    formData.question,
                    formData.answer
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
                    formData.correct_option
                );
            }

            setMessage('Question created successfully!');
            // Reset form
            setFormData({
                question: '',
                type: 'SHORT',
                answer: '',
                option_a: '',
                option_b: '',
                option_c: '',
                option_d: '',
                option_e: '',
                correct_option: 'A'
            });
        } catch (err) {
            console.error('Error creating question:', err);
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
                    {/* Question Text */}
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="question"
                            value={formData.question}
                            onChange={handleInputChange}
                            placeholder="Enter your question..."
                            required
                        />
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
                            <Form.Label>Expected Answer</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="answer"
                                value={formData.answer}
                                onChange={handleInputChange}
                                placeholder="Enter the expected answer..."
                                required
                            />
                        </Form.Group>
                    )}

                    {/* Multiple Choice Fields */}
                    {formData.type === 'MCQ' && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option A</Form.Label>
                                        <Form.Control
                                            name="option_a"
                                            value={formData.option_a}
                                            onChange={handleInputChange}
                                            placeholder="Enter option A..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option B</Form.Label>
                                        <Form.Control
                                            name="option_b"
                                            value={formData.option_b}
                                            onChange={handleInputChange}
                                            placeholder="Enter option B..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option C</Form.Label>
                                        <Form.Control
                                            name="option_c"
                                            value={formData.option_c}
                                            onChange={handleInputChange}
                                            placeholder="Enter option C..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option D</Form.Label>
                                        <Form.Control
                                            name="option_d"
                                            value={formData.option_d}
                                            onChange={handleInputChange}
                                            placeholder="Enter option D..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option E</Form.Label>
                                        <Form.Control
                                            name="option_e"
                                            value={formData.option_e}
                                            onChange={handleInputChange}
                                            placeholder="Enter option E..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Correct Answer</Form.Label>
                                        <Form.Select
                                            name="correct_option"
                                            value={formData.correct_option}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                            <option value="E">E</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
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