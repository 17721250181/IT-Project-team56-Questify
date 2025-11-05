import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * ContinueSection - Display user's last attempted question
 */
const ContinueSection = ({ lastAttempt, lastQuestion, loading }) => {
    const formatWeek = (weekString) => {
        if (!weekString) return '';
        return weekString.replace(/^Week\s+(\d+)$/, 'Week$1');
    };

    return (
        <Card className="border-0 shadow-sm mb-4 mt-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Continue where you left off</h5>
                </div>
                {loading ? (
                    <div className="text-muted small">Loading your recent activity…</div>
                ) : lastAttempt ? (
                    <Row className="g-3 g-md-4">
                        <Col sm={12} md={6} lg={4}>
                            <Card className="h-100 shadow-sm hover-raise compact-card">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge rounded-pill text-body-secondary border bg-light">
                                            {lastQuestion?.type || lastAttempt.type || 'Type'}
                                        </span>
                                        {lastQuestion?.verify_status === 'APPROVED' && (
                                            <span className="text-success small">
                                                <i className="bi bi-shield-check me-1"></i>Verified
                                            </span>
                                        )}
                                        {lastQuestion?.verify_status === 'REJECTED' && (
                                            <span className="text-danger small">
                                                <i className="bi bi-slash-circle me-1"></i>Rejected
                                            </span>
                                        )}
                                        {typeof lastAttempt.is_correct === 'boolean' && (
                                            <span
                                                className={`small ${
                                                    lastAttempt.is_correct ? 'text-success' : 'text-danger'
                                                }`}
                                            >
                                                <i
                                                    className={`bi me-1 ${
                                                        lastAttempt.is_correct
                                                            ? 'bi-check-circle'
                                                            : 'bi-x-circle'
                                                    }`}
                                                ></i>
                                                {lastAttempt.is_correct ? 'Correct' : 'Incorrect'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-2 small text-muted">
                                        {(lastQuestion?.topic || lastAttempt.topic) && (
                                            <span className="me-2">
                                                {lastQuestion?.topic || lastAttempt.topic}
                                            </span>
                                        )}
                                        {(lastQuestion?.week || lastAttempt.week) && (
                                            <span>{formatWeek(lastQuestion?.week || lastAttempt.week)}</span>
                                        )}
                                    </div>
                                    <div
                                        className="mb-2 break-words line-clamp-2"
                                        style={{ minHeight: '3em' }}
                                    >
                                        {lastQuestion?.question ||
                                            lastAttempt.question_text ||
                                            'Recent question'}
                                    </div>
                                    <div className="mt-auto d-flex justify-content-between align-items-center text-muted small">
                                        <div className="d-flex align-items-center gap-3">
                                            <span title="Rating">
                                                <i className="bi bi-star-fill text-warning me-1"></i>
                                                {Number(lastQuestion?.rating ?? 0).toFixed(1)}
                                            </span>
                                            <span title="Attempts">
                                                <i className="bi bi-pencil-square me-1"></i>
                                                {lastQuestion?.numAttempts ?? lastQuestion?.num_attempts ?? 0}
                                            </span>
                                        </div>
                                        <Button
                                            as={Link}
                                            to={`/question/${lastAttempt.question}`}
                                            variant="primary"
                                            size="sm"
                                        >
                                            Resume
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <div className="text-muted small">
                        No attempts yet. Start with any question to begin tracking.
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ContinueSection;
