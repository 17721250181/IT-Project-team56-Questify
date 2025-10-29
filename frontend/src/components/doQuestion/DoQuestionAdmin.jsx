import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Badge, Form } from 'react-bootstrap';
import { QuestionService } from '../../services/QuestionService';
import { useParams } from 'react-router-dom';
import DoQuestionMCQ from './DoQuestionMCQ';
import DoQuestionShort from './DoQuestionShort';

/**
 * Admin variant of DoQuestion component
 * Allows admins to verify if a question is valid or not
 */
const DoQuestionAdmin = () => {
    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [submittingVerification, setSubmittingVerification] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

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
                verifyStatus: raw.verify_status, // "PENDING", "APPROVED", "REJECTED"
                adminFeedback: raw.admin_feedback ?? "",
            };

            setQuestion(mapped);

            // Set verification status based on backend data
            if (mapped.verifyStatus === 'APPROVED') {
                setVerificationStatus('approved');
            } else if (mapped.verifyStatus === 'REJECTED') {
                setVerificationStatus('rejected');
                setRejectionReason(mapped.adminFeedback);
            }

        } catch (err) {
            console.error("Failed to fetch question:", err);
            setError("Unable to load question.");
        } finally {
            setLoading(false);
        }
    }, [questionId]);

    // Fetch question data when component mounts
    useEffect(() => {
        if (questionId) {
            fetchQuestion();
        }
    }, [questionId, fetchQuestion]);

    // Handle question verification
    const handleVerifyQuestion = async (approved) => {
        try {
            setSubmittingVerification(true);
            setError(null);

            const response = await QuestionService.verifyQuestion(questionId, approved, rejectionReason);
            
            console.log('Question verification submitted:', {
                questionId,
                approved,
                rejectionReason: approved ? '' : rejectionReason
            });

            setVerificationStatus(approved ? 'approved' : 'rejected');
            
            // Update local state with response data
            setQuestion({
                ...question,
                verifyStatus: response.verify_status,
                adminFeedback: response.admin_feedback ?? ""
            });

        } catch (err) {
            console.error('Failed to submit verification:', err);
            setError(err.message || 'Failed to submit verification.');
        } finally {
            setSubmittingVerification(false);
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

    // Error state
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
            
            {/* Question options/answers */}
            <Row className="mb-3 text-start">
                <Col>
                    <h5 className="mb-3">Question Details:</h5>
                    {question.type === 'MCQ' ? (
                        <DoQuestionMCQ
                            question={question}
                            selectedAnswers={[]}
                            onAnswerChange={() => {}} // No interaction in admin view
                            submitted={true}
                            readOnly={true}
                        />
                    ) : (
                        <DoQuestionShort
                            question={question}
                            userAnswer="Admin View, answer not applicable. See expected answer below."
                            onAnswerChange={() => {}} // No interaction in admin view
                            submitted={true}
                            readOnly={true}
                        />
                    )}
                </Col>
            </Row>

            {/* Correct answer reference */}
            {question.type === 'MCQ' && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="info">
                            <strong>Correct Answer:</strong> {question.correctOptions.join(', ')}
                        </Alert>
                    </Col>
                </Row>
            )}

            {question.type === 'Short' && question.answer && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="info">
                            <strong>Expected Answer:</strong> {question.answer}
                        </Alert>
                    </Col>
                </Row>
            )}

            {question.type === 'Short' && question.aiAnswer && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="secondary">
                            <strong>AI Generated Answer:</strong> {question.aiAnswer}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Verification status */}
            {verificationStatus && verificationStatus !== 'pending' && (
                <Alert variant={verificationStatus === 'approved' ? 'success' : 'danger'}>
                    <Alert.Heading>
                        {verificationStatus === 'approved' ? '✓ Question Approved' : '✗ Question Rejected'}
                    </Alert.Heading>
                    <p>
                        {verificationStatus === 'approved' 
                            ? 'This question has been verified and approved for use.'
                            : 'This question has been rejected and will not appear in the question pool.'}
                    </p>
                    {question.adminFeedback && verificationStatus === 'rejected' && (
                        <div className="mt-2">
                            <strong>Rejection Reason:</strong>
                            <p className="mb-0 mt-1">{question.adminFeedback}</p>
                        </div>
                    )}
                </Alert>
            )}

            {/* Pending verification notice */}
            {(!verificationStatus || verificationStatus === 'pending') && (
                <Alert variant="warning">
                    <Alert.Heading>⏳ Pending Verification</Alert.Heading>
                    <p className="mb-0">This question is awaiting admin verification. Please review and approve or reject below.</p>
                </Alert>
            )}

            {/* Error message */}
            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            {/* Verification controls (only show if not yet verified) */}
            {(!verificationStatus || verificationStatus === 'pending') && (
                <Row className="mb-3">
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label><strong>Rejection Reason (Required if rejecting):</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Explain why this question is invalid (e.g., incorrect answer, unclear wording, duplicate, etc.)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}

            {/* Action buttons */}
            {(!verificationStatus || verificationStatus === 'pending') && (
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Button
                            variant="success"
                            size="md"
                            disabled={submittingVerification}
                            onClick={() => handleVerifyQuestion(true)}
                            className="me-2"
                        >
                            {submittingVerification ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="me-2"
                                    />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Approve Question
                                </>
                            )}
                        </Button>
                        <Button
                            variant="danger"
                            size="md"
                            disabled={submittingVerification || (!rejectionReason.trim())}
                            onClick={() => handleVerifyQuestion(false)}
                        >
                            {submittingVerification ? (
                                'Verifying...'
                            ) : (
                                <>
                                    <i className="bi bi-x-circle me-1"></i>
                                    Reject Question
                                </>
                            )}
                        </Button>
                    </Col>
                    {!rejectionReason.trim() && (
                        <Col xs={12} className="mt-2">
                            <small className="text-muted">
                                * Rejection reason is required to reject a question
                            </small>
                        </Col>
                    )}
                </Row>
            )}
        </Container>
    );
};

export default DoQuestionAdmin;
