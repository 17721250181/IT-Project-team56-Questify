import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { QuestionService } from '../services/QuestionService.js';
import { useParams } from 'react-router-dom';

const DoQuestion = () => {
    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    // Fetch question data from backend
    const fetchQuestion = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const raw = await QuestionService.getQuestionById(questionId);

            const mapped = {
                id: raw.id,
                title: raw.question, 
                type: raw.type,
                options: raw.mcq_detail ? Object.values(raw.mcq_detail.options) : [],
                correctOptions: raw.mcq_detail?.correct_options ?? [],
                multipleAnswers: raw.mcq_detail ? raw.mcq_detail.correct_options.length > 1 : false,
                answer: raw.short_detail?.answer ?? "",
                aiAnswer: raw.short_detail?.ai_answer ?? "",
            };

            setQuestion(mapped);

            if (mapped.type === "MCQ") {
                setSelectedAnswers([]);
            } else {
                setUserAnswer('');
            }
        } catch (err) {
            console.error("Failed to fetch question:", err);
            setError("Unable to load question.");
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

            // Use API to submit answer
            const response = await QuestionService.submitAnswer(
                questionId,
                question.type === 'MCQ'
                    ? selectedAnswers.map(i => String.fromCharCode(65 + i))
                    : userAnswer
            );
            console.log('Answer submitted successfully:', response);

            // Check if answer is correct (for MCQ only)
            if (question.type === 'MCQ') {
                const userAnswerLetters = selectedAnswers
                    .map(i => String.fromCharCode(65 + i))
                    .sort();
                const correctAnswerLetters = [...question.correctOptions].sort();
                
                const correct = JSON.stringify(userAnswerLetters) === JSON.stringify(correctAnswerLetters);
                setIsCorrect(correct);
            } else {
                setIsCorrect(null); // No auto-checking for short answer
            }

            setSubmitted(true);
            setShowResult(true);
        } catch (err) {
            console.error('Failed to submit answer:', err);
            // Only show error message, don't mark as successfully submitted
            setError('Failed to submit to server.');

            //delete later
            setSubmitted(true);
            setShowResult(true);
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

        if (question?.type === 'MCQ') {
            return selectedAnswers.length > 0;
        } else {
            return userAnswer.trim().length > 0;
        }
    };

    // Render multiple choice options
    const renderMultipleChoice = () => {
        return (
            <Form className='m-1'>
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
            <Form className='m-1'>
                <Form.Group className="m-1">
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
        <Container className="p-4 rounded shadow-sm bg-light">
            {/* Question title and type badge */}
            <Row className='mb-3'>
                <Col className='text-center text-md-start' xs={12} md={9}>
                    <h4 className="m-1">{question.title}</h4>
                </Col>
                <Col className='text-center text-md-end' xs={12} md={3}>
                    <Badge bg={question.type === 'MCQ' ? 'success' : 'info'}>
                        {question.type === 'MCQ'
                            ? question.multipleAnswers
                                ? 'Multiple Choice'
                                : 'Single Choice'
                            : 'Open Question'}
                    </Badge>
                </Col>
            </Row>
            <hr />
            
            {/* Question content */}
            <Row className="mb-1 text-start">
                <p className="m-1">{question.content}</p>
            </Row>

            {/* Answer area */}
            <Row className="mb-3 text-start">
                {question.type === 'MCQ' ? (
                    <>
                        <p className="text-secondary m-1">Please select answer:</p>
                        {renderMultipleChoice()}
                        
                        {/* Show correct answers after submission */}
                        {submitted && (
                            <div className="m-1 mt-4 pt-3 border-top">
                                <p className="mb-2"><strong>Correct Answer:</strong></p>
                                <div>
                                    {question.correctOptions && question.correctOptions.length > 0
                                        ? question.correctOptions
                                            .sort()
                                            .map(letter => {
                                                const index = letter.charCodeAt(0) - 65;
                                                return (
                                                    <div key={letter} className="mb-1">
                                                        <Badge bg="info" className="me-2">
                                                            {letter}
                                                        </Badge>
                                                        <span className="">
                                                            {question.options[index]}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        : <span className="text-muted">Not available</span>
                                    }
                                </div>
                            </div>
                        )}
                    </>
                ) : !submitted ? (
                    <>
                        <p className="text-secondary m-1">Please enter answer:</p>
                        {renderOpenQuestion()}
                    </>
                ) : (
                    <div className="m-1">
                        <p><strong>Your Answer:</strong></p>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={userAnswer}
                            readOnly
                            className="mb-3"
                        />

                        <p><strong>Answer:</strong></p>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={question?.answer || "No standard answer provided."}
                            readOnly
                            className="mb-3"
                        />

                        <p><strong>AI Answer:</strong></p>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={question?.aiAnswer || "No AI answer available."}
                            readOnly
                        />
                    </div>
                )}
            </Row>

            {/* Submit result */}
            {showResult && submitted && (
                <Alert variant={
                    question.type === 'MCQ' 
                        ? (isCorrect ? 'success' : 'danger')
                        : 'info'
                }>
                    <Alert.Heading>
                        {question.type === 'MCQ' 
                            ? (isCorrect ? 'Correct!' : 'Incorrect')
                            : 'Submitted Successfully!'}
                    </Alert.Heading>
                    <p>
                        {question.type === 'MCQ' 
                            ? (isCorrect 
                                ? 'Great job! Your answer is correct.' 
                                : "Your answer doesn't match the correct answer.")
                            : 'Your answer has been submitted successfully.'}
                    </p>
                </Alert>
            )}

            {/* Error message */}
            {/* {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )} */}

            {/* Submit button */}
            <Row className="align-items-center">
                <Col xs="auto">
                    <Button
                        variant="primary"
                        size="md"
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
        </Container>
    );
};

export default DoQuestion;
