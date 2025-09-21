import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { QuestionService } from '../services/QuestionService.js';

const DoQuestion = ({ questionId }) => {
    const [question, setQuestion] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    // const [isUsingTemplate, setIsUsingTemplate] = useState(false); // Currently always using template data

    // Template question data
    const getTemplateQuestion = (id) => {
        const templates = [
            {
                id: 1,
                title: 'Java Variables and Data Types',
                content: 'Which of the following are primitive data types in Java?',
                type: 'multiple_choice',
                multipleAnswers: true,
                points: 10,
                options: ['int', 'String', 'boolean', 'double', 'ArrayList'],
            },
            {
                id: 2,
                title: 'Object-Oriented Design Principles',
                content:
                    'Which of the following are core principles of Object-Oriented Programming?',
                type: 'multiple_choice',
                multipleAnswers: true,
                points: 15,
                options: [
                    'Encapsulation',
                    'Inheritance',
                    'Polymorphism',
                    'Abstraction',
                    'Compilation',
                ],
            },
            {
                id: 3,
                title: 'Java Class Constructors',
                content:
                    'Explain what a constructor is in Java and write a simple example of a class with a constructor.',
                type: 'open_question',
                points: 20,
            },
            {
                id: 4,
                title: 'Inheritance and Polymorphism',
                content: 'Describe the relationship between inheritance and polymorphism in Java. Provide a code example demonstrating both concepts.',
                type: 'open_question',
                points: 25,
            },
            {
                id: 5,
                title: 'Exception Handling in Java',
                content: 'Which keywords are used for exception handling in Java?',
                type: 'multiple_choice',
                multipleAnswers: true,
                points: 12,
                options: [
                    'try',
                    'catch',
                    'finally',
                    'throw',
                    'handle'
                ],
            },
            {
                id: 6,
                title: 'Array and ArrayList Operations',
                content: 'What is the main difference between arrays and ArrayLists in Java? Write a simple code example showing how to create and add elements to an ArrayList.',
                type: 'open_question',
                points: 18,
            },
        ];

        return templates.find((q) => q.id === id) || templates[0];
    };

    // Fetch question data from backend
    const fetchQuestion = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Use API to fetch question data
            const questionData = await QuestionService.getQuestionById(questionId);
            setQuestion(questionData);

            // Initialize answer state based on question type
            if (questionData.type === 'multiple_choice') {
                setSelectedAnswers([]);
            } else {
                setUserAnswer('');
            }
        } catch (err) {
            console.error('Failed to fetch question:', err);
            // Fallback to template data if API fails
            const questionData = getTemplateQuestion(questionId);
            setQuestion(questionData);

            // Initialize answer state for fallback data
            if (questionData.type === 'multiple_choice') {
                setSelectedAnswers([]);
            } else {
                setUserAnswer('');
            }

            // Only set error if we couldn't get template data either
            if (!questionData) {
                setError('Unable to load question from server and no template available.');
            }
            // If we have template data, clear any previous error
            else {
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    }, [questionId]);

    // Handle multiple choice answer selection
    const handleOptionChange = (optionIndex, isChecked) => {
        if (question.multipleAnswers) {
            // Multiple choice question
            if (isChecked) {
                setSelectedAnswers([...selectedAnswers, optionIndex]);
            } else {
                setSelectedAnswers(selectedAnswers.filter((index) => index !== optionIndex));
            }
        } else {
            // Single choice question
            setSelectedAnswers([optionIndex]);
        }
    };

    // Submit answer
    const handleSubmitAnswer = async () => {
        try {
            setLoading(true);
            setError(null);

            const answerData = {
                question_id: questionId,
                answer: question.type === 'multiple_choice' ? selectedAnswers : userAnswer,
                type: question.type,
            };

            // Use API to submit answer
            const response = await QuestionService.submitAnswer(answerData);
            console.log('Answer submitted successfully:', response);

            setSubmitted(true);
            setShowResult(true);
        } catch (err) {
            console.error('Failed to submit answer:', err);
            // Only show error message, don't mark as successfully submitted
            setError('Failed to submit to server.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch question data when component mounts
    useEffect(() => {
        if (questionId) {
            fetchQuestion();
        }
    }, [questionId, fetchQuestion]);

    // Check if answer can be submitted
    const canSubmit = () => {
        if (submitted) return false;

        if (question?.type === 'multiple_choice') {
            return selectedAnswers.length > 0;
        } else {
            return userAnswer.trim().length > 0;
        }
    };

    // Render multiple choice options
    const renderMultipleChoice = () => {
        return (
            <Form>
                {question.options?.map((option, index) => (
                    <Form.Check
                        key={index}
                        type={question.multipleAnswers ? 'checkbox' : 'radio'}
                        id={`option-${index}`}
                        name="question-options"
                        label={option}
                        checked={selectedAnswers.includes(index)}
                        onChange={(e) => handleOptionChange(index, e.target.checked)}
                        disabled={submitted}
                        className="mb-2"
                    />
                ))}
            </Form>
        );
    };

    // Render open-ended question
    const renderOpenQuestion = () => {
        return (
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Your Answer:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={submitted}
                        placeholder="Please enter your answer here..."
                    />
                </Form.Group>
            </Form>
        );
    };

    // Loading state
    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading question...</p>
            </Container>
        );
    }

    // Error state - only show if we have a blocking error and no question data
    if (error && !question) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchQuestion}>
                        Reload
                    </Button>
                </Alert>
            </Container>
        );
    }

    // No question data
    if (!question) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">
                    <Alert.Heading>Question Not Found</Alert.Heading>
                    <p>Please check if the question ID is correct.</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col lg={8} md={10} sm={12}>
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <Row className="align-items-center">
                                <Col>
                                    <h4 className="mb-0">{question.title}</h4>
                                </Col>
                                <Col xs="auto">
                                    <Badge
                                        bg={
                                            question.type === 'multiple_choice' ? 'success' : 'info'
                                        }
                                    >
                                        {question.type === 'multiple_choice'
                                            ? question.multipleAnswers
                                                ? 'Multiple Choice'
                                                : 'Single Choice'
                                            : 'Open Question'}
                                    </Badge>
                                </Col>
                            </Row>
                        </Card.Header>

                        <Card.Body>
                            {/* Question content */}
                            <div className="mb-4">
                                <h5 className="text-primary mb-3">Question:</h5>
                                <p className="fs-5 lh-base">{question.content}</p>
                            </div>

                            {/* Answer area */}
                            <div className="mb-4">
                                <h5 className="text-success mb-3">
                                    {question.type === 'multiple_choice'
                                        ? 'Please select answer:'
                                        : 'Please enter answer:'}
                                </h5>

                                {question.type === 'multiple_choice'
                                    ? renderMultipleChoice()
                                    : renderOpenQuestion()}
                            </div>

                            {/* Submit result */}
                            {showResult && submitted && (
                                <Alert variant="success">
                                    <Alert.Heading>Submitted Successfully!</Alert.Heading>
                                    <p>Your answer has been submitted successfully.</p>
                                </Alert>
                            )}

                            {/* Error message */}
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light">
                            <Row className="align-items-center">
                                <Col>
                                    {question.points && (
                                        <small className="text-muted">
                                            Points: {question.points}
                                        </small>
                                    )}
                                </Col>
                                <Col xs="auto">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        disabled={!canSubmit() || loading}
                                        onClick={handleSubmitAnswer}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    className="me-2"
                                                />
                                                Submitting...
                                            </>
                                        ) : submitted ? (
                                            'Submitted'
                                        ) : (
                                            'Submit Answer'
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DoQuestion;
