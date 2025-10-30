import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Badge, ButtonGroup, Card } from 'react-bootstrap';
import { QuestionService } from '../../services/QuestionService.js';
import { AttemptService } from '../../services/attemptService.js';
import { useParams, useNavigate } from 'react-router-dom';
import DoQuestionMCQ from './DoQuestionMCQ';
import DoQuestionShort from './DoQuestionShort';

const DoQuestion = () => {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savingQuestion, setSavingQuestion] = useState(false);
    const [questionsList, setQuestionsList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [previousAttempt, setPreviousAttempt] = useState(null);
    const [showAttemptView, setShowAttemptView] = useState(true);

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
            setIsSaved(raw.is_saved || false);

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

    // Check if user has previously attempted this question
    const checkPreviousAttempt = useCallback(async () => {
        try {
            const attempts = await AttemptService.getQuestionAttempts(questionId);
            if (attempts && attempts.length > 0) {
                // Get the most recent attempt (assuming they're sorted by date, newest first)
                const latestAttempt = attempts[0];
                setPreviousAttempt(latestAttempt);
                setShowAttemptView(true);
            } else {
                setPreviousAttempt(null);
                setShowAttemptView(false);
            }
        } catch (err) {
            console.error("Failed to check previous attempts:", err);
            // If there's an error, assume no previous attempt and continue
            setPreviousAttempt(null);
            setShowAttemptView(false);
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

    // Handle save/unsave question
    const handleToggleSave = async () => {
        try {
            setSavingQuestion(true);
            const response = await QuestionService.toggleSaveQuestion(questionId);
            console.log('Toggle save response:', response);
            
            // Toggle the saved state
            setIsSaved(!isSaved);
        } catch (err) {
            console.error('Failed to save/unsave question:', err);
            setError(err.message || 'Failed to save question.');
        } finally {
            setSavingQuestion(false);
        }
    };

    // Handle retry - allow user to attempt the question again
    const handleRetry = () => {
        setShowAttemptView(false);
        setSubmitted(false);
        setShowResult(false);
        setIsCorrect(null);
        setSelectedAnswers([]);
        setUserAnswer('');
    };

    // Fetch all questions for navigation
    useEffect(() => {
        const loadQuestionsList = async () => {
            try {
                // Try to get saved filters and sorting from sessionStorage
                const savedFilters = sessionStorage.getItem('questionFilters');
                const savedSort = sessionStorage.getItem('questionSort');
                const savedSearch = sessionStorage.getItem('questionSearch');
                
                console.log('Loading questions list with saved preferences:', { savedFilters, savedSort, savedSearch });
                
                let filters = {};
                let sort = undefined;
                let search = undefined;
                
                // Parse saved filters if they exist
                if (savedFilters) {
                    try {
                        const parsedFilters = JSON.parse(savedFilters);
                        // Use the saved filters as-is, don't override
                        filters = { ...parsedFilters };
                    } catch (e) {
                        console.error('Failed to parse saved filters:', e);
                    }
                }
                
                if (savedSort) {
                    sort = savedSort;
                }
                
                if (savedSearch) {
                    search = savedSearch;
                }
                
                // Fetch questions with user's filters and sorting
                const questions = await QuestionService.getAllQuestions({
                    filters: filters,
                    sort: sort,
                    search: search
                });
                
                setQuestionsList(questions);
                
                // Find current question index
                const index = questions.findIndex(q => q.id === questionId);
                setCurrentIndex(index);
            } catch (err) {
                console.error('Failed to load questions list:', err);
            }
        };

        loadQuestionsList();
    }, [questionId]);

    // Fetch question data when component mounts
    useEffect(() => {
        if (questionId) {
            fetchQuestion();
            checkPreviousAttempt();
            // Reset submission state when changing questions
            setSubmitted(false);
            setShowResult(false);
            setIsCorrect(null);
        }
    }, [questionId, fetchQuestion, checkPreviousAttempt]);

    // Navigation functions
    const navigateToQuestion = (newQuestionId) => {
        navigate(`/question/${newQuestionId}`);
    };

    const handlePrevious = () => {
        if (currentIndex > 0 && questionsList.length > 0) {
            navigateToQuestion(questionsList[currentIndex - 1].id);
        }
    };

    const handleNext = () => {
        if (currentIndex < questionsList.length - 1 && questionsList.length > 0) {
            navigateToQuestion(questionsList[currentIndex + 1].id);
        }
    };

    const handleRandom = () => {
        if (questionsList.length > 0) {
            // Get a random question that's not the current one
            const availableQuestions = questionsList.filter(q => q.id !== questionId);
            if (availableQuestions.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableQuestions.length);
                navigateToQuestion(availableQuestions[randomIndex].id);
            }
        }
    };

    // Check if answer can be submitted
    const canSubmit = () => {
        if (submitted) return false;

        if (question?.type === 'MCQ') {
            return selectedAnswers.length > 0;
        } else {
            return userAnswer.trim().length > 0;
        }
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
            {/* Question Navigation */}
            <Row className='mb-3'>
                <Col className='d-flex justify-content-center'>
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-primary"
                            onClick={handlePrevious}
                            disabled={currentIndex <= 0 || questionsList.length === 0}
                            title="Previous question"
                        >
                            <i className="bi bi-chevron-left"></i> Previous
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={handleRandom}
                            disabled={questionsList.length <= 1}
                            title="Random question"
                        >
                            <i className="bi bi-shuffle"></i> Random
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={handleNext}
                            disabled={currentIndex >= questionsList.length - 1 || questionsList.length === 0}
                            title="Next question"
                        >
                            Next <i className="bi bi-chevron-right"></i>
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            {/* Question title and type badge */}
            <Row className='mb-3'>
                <Col className='text-center text-md-start' xs={12} md={7}>
                    <h4 className="m-1">{question.title}</h4>
                </Col>
                <Col className='text-center text-md-end' xs={12} md={5}>
                    <Button
                        variant={isSaved ? 'warning' : 'outline-warning'}
                        size="sm"
                        onClick={handleToggleSave}
                        disabled={savingQuestion}
                        className="me-2"
                        title={isSaved ? 'Unsave question' : 'Save question'}
                    >
                        <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                        {savingQuestion ? ' Saving...' : (isSaved ? ' Saved' : ' Save')}
                    </Button>
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
            
            {/* Show previous attempt if exists and user hasn't clicked retry */}
            {previousAttempt && showAttemptView ? (
                <Card className="mb-3">
                    <Card.Header className="bg-info text-white">
                        <h5 className="mb-0">
                            <i className="bi bi-clock-history me-2"></i>
                            Previous Attempt
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col>
                                <strong>Attempted on:</strong> {new Date(previousAttempt.submitted_at).toLocaleString()}
                            </Col>
                            {previousAttempt.is_correct !== null && (
                                <Col xs="auto">
                                    <Badge bg={previousAttempt.is_correct ? 'success' : 'danger'} className="ms-2">
                                        {previousAttempt.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                    </Badge>
                                </Col>
                            )}
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <strong>Your Answer:</strong>
                                <div className="mt-2 p-3 bg-light rounded">
                                    {Array.isArray(previousAttempt.answer) 
                                        ? previousAttempt.answer.join(', ')
                                        : previousAttempt.answer}
                                </div>
                            </Col>
                        </Row>
                        {question.type === 'MCQ' && (
                            <Row className="mb-3">
                                <Col>
                                    <strong>Correct Answer:</strong>
                                    <div className="mt-2 p-3 bg-success bg-opacity-10 rounded text-success">
                                        {question.correctOptions.join(', ')}
                                    </div>
                                </Col>
                            </Row>
                        )}
                        {question.type === 'SHORT' && question.answer && (
                            <Row className="mb-3">
                                <Col>
                                    <strong>Sample Answer:</strong>
                                    <div className="mt-2 p-3 bg-success bg-opacity-10 rounded">
                                        {question.answer}
                                    </div>
                                </Col>
                            </Row>
                        )}
                        {question.type === 'SHORT' && question.aiAnswer && (
                            <Row className="mb-3">
                                <Col>
                                    <strong>AI-Generated Answer:</strong>
                                    <div className="mt-2 p-3 bg-info bg-opacity-10 rounded">
                                        {question.aiAnswer}
                                    </div>
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col>
                                <Button 
                                    variant="primary" 
                                    onClick={handleRetry}
                                    className="w-100"
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Retry Question
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    {/* Answer area */}
                    <Row className="mb-3 text-start">
                        {question.type === 'MCQ' ? (
                            <DoQuestionMCQ
                                question={question}
                                selectedAnswers={selectedAnswers}
                                onAnswerChange={handleOptionChange}
                                submitted={submitted}
                            />
                        ) : (
                            <DoQuestionShort
                                question={question}
                                userAnswer={userAnswer}
                                onAnswerChange={setUserAnswer}
                                submitted={submitted}
                            />
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
                </>
            )}
        </Container>
    );
};

export default DoQuestion;
