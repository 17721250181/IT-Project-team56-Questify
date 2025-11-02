import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { QuestifyNavBar } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import { AttemptService } from '../services/attemptService';
import { QuestionService } from '../services/QuestionService';
import '../styles/HomePage.css';

/**
 * Home Page - Landing page for authenticated users
 * Placeholder for future development
 */
const HomePage = () => {
    const { user } = useAuth();

    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-4 mb-5">
                <Row className="justify-content-center">
                    <Col md={11} lg={10}>
                        {/* Hero */}
                        <Card className="border-0 shadow-sm mb-4 home-hero fade-in">
                            <Card.Body className="py-4 py-md-5">
                                <Row className="align-items-center">
                                    <Col md={7} className="text-center text-md-start">
                                        <div className="mb-2 text-muted">Welcome back{user ? `, ${user.display_name || user.email}` : ''}</div>
                                        <h1 className="fw-bold" style={{ letterSpacing: '-0.02em' }}>Practice smarter. Discuss deeper.</h1>
                                        <p className="text-muted mb-4">Browse questions, track your progress, and learn with peers.</p>
                                        <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                                            <Button as={Link} to="/questions" variant="primary" className="btn-glow">
                                                Start Practicing
                                            </Button>
                                            <Button as={Link} to="/user-profile" variant="outline-primary" className="btn-glow-outline">
                                                View Profile
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col md={5} className="d-none d-md-block">
                                        <div className="p-4 bg-white rounded-4 shadow-sm h-100 d-flex align-items-center justify-content-center icon-float">
                                            <div className="text-center">
                                                <i className="bi bi-magic" style={{ fontSize: '2rem', color: '#3b82f6' }}></i>
                                                <div className="mt-2 small text-muted">Keep up the streak!</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Quick Actions */}
                        <Row className="g-3 g-md-4 mb-4">
                            <Col sm={6} lg={3}>
                                <Card className="h-100 shadow-sm hover-raise fade-in-up">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-grid-3x3-gap-fill text-primary"></i>
                                            <Card.Title className="mb-0">Browse</Card.Title>
                                        </div>
                                        <Card.Text className="text-muted small">Explore and practice questions.</Card.Text>
                                        <Button as={Link} to="/questions" variant="primary" className="mt-auto btn-glow">Go</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={6} lg={3}>
                                <Card className="h-100 shadow-sm hover-raise fade-in-up">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-bookmark-fill text-warning"></i>
                                            <Card.Title className="mb-0">Saved</Card.Title>
                                        </div>
                                        <Card.Text className="text-muted small">Jump to your saved questions.</Card.Text>
                                        <Button as={Link} to="/questions" variant="outline-primary" className="mt-auto btn-glow-outline">Open</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={6} lg={3}>
                                <Card className="h-100 shadow-sm hover-raise fade-in-up">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-clipboard-check text-success"></i>
                                            <Card.Title className="mb-0">My Attempts</Card.Title>
                                        </div>
                                        <Card.Text className="text-muted small">Review your recent attempts.</Card.Text>
                                        <Button as={Link} to="/user-profile" variant="outline-primary" className="mt-auto btn-glow-outline">View</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={6} lg={3}>
                                <Card className="h-100 shadow-sm hover-raise fade-in-up">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-trophy text-danger"></i>
                                            <Card.Title className="mb-0">Leaderboard</Card.Title>
                                        </div>
                                        <Card.Text className="text-muted small">See who’s on top this week.</Card.Text>
                                        <Button as={Link} to="/leaderboard" variant="outline-primary" className="mt-auto btn-glow-outline">Rankings</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Continue & Recommended */}
                        <HomeDynamicBlocks />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

const HomeDynamicBlocks = () => {
    const [attempts, setAttempts] = useState([]);
    const [loadingAttempts, setLoadingAttempts] = useState(true);
    const [lastQuestion, setLastQuestion] = useState(null);
    const [loadingLastQuestion, setLoadingLastQuestion] = useState(false);
    const [recommended, setRecommended] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(true);

    // Format week to ensure consistent display (remove spaces)
    const formatWeek = (weekString) => {
        if (!weekString) return '';
        // Remove spaces between "Week" and number to ensure consistency
        // "Week 5" -> "Week5", "Week 10" -> "Week10"
        return weekString.replace(/^Week\s+(\d+)$/, 'Week$1');
    };

    const lastAttempt = useMemo(() => {
        if (!attempts || attempts.length === 0) return null;
        // assume attempts sorted by submitted_at desc; if not, sort defensively
        const sorted = [...attempts].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0));
        return sorted[0];
    }, [attempts]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setLoadingAttempts(true);
                const data = await AttemptService.getUserAttempts();
                if (!active) return;
                setAttempts(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!active) return;
                setAttempts([]);
            } finally {
                if (active) setLoadingAttempts(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    // Load full question for last attempt to render consistent card info
    useEffect(() => {
        let active = true;
        const loadLastQuestion = async () => {
            if (!lastAttempt?.question) { setLastQuestion(null); return; }
            try {
                setLoadingLastQuestion(true);
                const q = await QuestionService.getQuestionById(lastAttempt.question);
                if (!active) return;
                setLastQuestion(q || null);
            } catch (e) {
                if (!active) return;
                setLastQuestion(null);
            } finally {
                if (active) setLoadingLastQuestion(false);
            }
        };
        loadLastQuestion();
    }, [lastAttempt?.question]);

    useEffect(() => {
        let active = true;
        const loadRecommended = async () => {
            try {
                setLoadingRecommended(true);
                const topic = lastAttempt?.topic || null;
                const filters = topic ? { topic, verified: true } : { verified: true };
                const data = await QuestionService.getAllQuestions({ filters });
                if (!active) return;
                const list = Array.isArray(data) ? data.slice(0, 6) : [];
                setRecommended(list);
            } catch (e) {
                if (!active) return;
                setRecommended([]);
            } finally {
                if (active) setLoadingRecommended(false);
            }
        };
        loadRecommended();
        // re-run when lastAttempt topic changes
    }, [lastAttempt?.topic]);

    return (
        <>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Recommended for you</h5>
                        <Button as={Link} to="/questions" variant="outline-primary" size="sm">View all</Button>
                    </div>
                    {loadingRecommended ? (
                        <div className="text-muted small">Loading recommendations…</div>
                    ) : recommended.length === 0 ? (
                        <div className="text-muted small">No recommendations yet. Browse all questions to get started.</div>
                    ) : (
                        <Row className="g-3 g-md-4">
                            {recommended.map((q) => (
                                <Col sm={6} lg={4} key={q.id}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Body className="d-flex flex-column">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="badge rounded-pill text-body-secondary border bg-light">{q.type}</span>
                                                {q.verify_status === 'APPROVED' && (
                                                    <span className="text-success small"><i className="bi bi-shield-check me-1"></i>Verified</span>
                                                )}
                                                {q.verify_status === 'REJECTED' && (
                                                    <span className="text-danger small"><i className="bi bi-slash-circle me-1"></i>Rejected</span>
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
                                                <span title="Rating"><i className="bi bi-star-fill text-warning me-1"></i>{Number(q.rating ?? 0).toFixed(1)}</span>
                                                <span title="Attempts"><i className="bi bi-pencil-square me-1"></i>{q.numAttempts ?? q.num_attempts ?? 0}</span>
                                            </div>
                                            <Button as={Link} to={`/question/${q.id}`} variant="primary" className="mt-3">Practice</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4 mt-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Continue where you left off</h5>
                    </div>
                    {loadingAttempts ? (
                        <div className="text-muted small">Loading your recent activity…</div>
                    ) : lastAttempt ? (
                        <Row className="g-3 g-md-4">
                            <Col sm={12} md={6} lg={4}>
                                <Card className="h-100 shadow-sm hover-raise compact-card">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge rounded-pill text-body-secondary border bg-light">{lastQuestion?.type || lastAttempt.type || 'Type'}</span>
                                            {lastQuestion?.verify_status === 'APPROVED' && (
                                                <span className="text-success small"><i className="bi bi-shield-check me-1"></i>Verified</span>
                                            )}
                                            {lastQuestion?.verify_status === 'REJECTED' && (
                                                <span className="text-danger small"><i className="bi bi-slash-circle me-1"></i>Rejected</span>
                                            )}
                                            {typeof lastAttempt.is_correct === 'boolean' && (
                                                <span className={`small ${lastAttempt.is_correct ? 'text-success' : 'text-danger'}`}>
                                                    <i className={`bi me-1 ${lastAttempt.is_correct ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                                                    {lastAttempt.is_correct ? 'Correct' : 'Incorrect'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mb-2 small text-muted">
                                            {(lastQuestion?.topic || lastAttempt.topic) && <span className="me-2">{lastQuestion?.topic || lastAttempt.topic}</span>}
                                            {(lastQuestion?.week || lastAttempt.week) && <span>{formatWeek(lastQuestion?.week || lastAttempt.week)}</span>}
                                        </div>
                                        <div className="mb-2 break-words line-clamp-2" style={{ minHeight: '3em' }}>
                                            {lastQuestion?.question || lastAttempt.question_text || 'Recent question'}
                                        </div>
                                        <div className="mt-auto d-flex justify-content-between align-items-center text-muted small">
                                            <div className="d-flex align-items-center gap-3">
                                                <span title="Rating"><i className="bi bi-star-fill text-warning me-1"></i>{Number(lastQuestion?.rating ?? 0).toFixed(1)}</span>
                                                <span title="Attempts"><i className="bi bi-pencil-square me-1"></i>{lastQuestion?.numAttempts ?? lastQuestion?.num_attempts ?? 0}</span>
                                            </div>
                                            <Button as={Link} to={`/question/${lastAttempt.question}`} variant="primary" size="sm">Resume</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-muted small">No attempts yet. Start with any question to begin tracking.</div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default HomePage;
