import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * RecommendedQuestions - Display recommended questions based on user's recent activity
 */
const RecommendedQuestions = ({ questions, loading }) => {
    const formatWeek = (weekString) => {
        if (!weekString) return '';
        return weekString.replace(/^Week\s+(\d+)$/, 'Week$1');
    };

    return (
        <Card className="border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Recommended for you</h5>
                    <Button as={Link} to="/questions" variant="outline-primary" size="sm">
                        View all
                    </Button>
                </div>
                {loading ? (
                    <div className="text-muted small">Loading recommendations…</div>
                ) : questions.length === 0 ? (
                    <div className="text-muted small">
                        No recommendations yet. Browse all questions to get started.
                    </div>
                ) : (
                    <Row className="g-3 g-md-4">
                        {questions.map((q) => (
                            <Col sm={6} lg={4} key={q.id}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge rounded-pill text-body-secondary border bg-light">
                                                {q.type}
                                            </span>
                                            {q.verify_status === 'APPROVED' && (
                                                <span className="text-success small">
                                                    <i className="bi bi-shield-check me-1"></i>Verified
                                                </span>
                                            )}
                                            {q.verify_status === 'REJECTED' && (
                                                <span className="text-danger small">
                                                    <i className="bi bi-slash-circle me-1"></i>Rejected
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-2 small text-muted">
                                            {q.topic && <span className="me-2">{q.topic}</span>}
                                            {q.week && <span>{formatWeek(q.week)}</span>}
                                        </div>
                                        <div className="mb-2 break-words" style={{ minHeight: '3em' }}>
                                            {q.question}
                                        </div>
                                        <div className="mt-auto d-flex align-items-center gap-3 text-muted small">
                                            <span title="Rating">
                                                <i className="bi bi-star-fill text-warning me-1"></i>
                                                {Number(q.rating ?? 0).toFixed(1)}
                                            </span>
                                            <span title="Attempts">
                                                <i className="bi bi-pencil-square me-1"></i>
                                                {q.numAttempts ?? q.num_attempts ?? 0}
                                            </span>
                                        </div>
                                        <Button
                                            as={Link}
                                            to={`/question/${q.id}`}
                                            variant="primary"
                                            className="mt-3"
                                        >
                                            Practice
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

export default RecommendedQuestions;
