import React, { useEffect, useMemo, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

import { QuestifyNavBar, LoadingSpinner } from '../components/common';
import { adminService } from '../services/adminService.js';
import '../styles/AdminDashboardPage.css';

const formatDateTime = (value) => {
    if (!value) return '—';
    try {
        const date = new Date(value);
        return date.toLocaleString();
    } catch (error) {
        return value;
    }
};

const MetricCard = ({ title, value, subtitle, variant = 'primary' }) => (
    <Card className={`metric-card metric-card-${variant}`}>
        <Card.Body>
            <Card.Title>{title}</Card.Title>
            <div className="metric-value">{value}</div>
            {subtitle && <Card.Text className="metric-subtitle">{subtitle}</Card.Text>}
        </Card.Body>
    </Card>
);

const AdminDashboardPage = () => {
    const [overview, setOverview] = useState(null);
    const [userActivity, setUserActivity] = useState({ results: [], count: 0, limit: 0 });
    const [aiUsage, setAiUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadAdminData = async () => {
            try {
                setLoading(true);
                const [overviewData, userActivityData, aiUsageData] = await Promise.all([
                    adminService.getOverview(),
                    adminService.getUserActivity({ limit: 15 }),
                    adminService.getAiUsage(),
                ]);

                if (mounted) {
                    setOverview(overviewData);
                    setUserActivity(userActivityData);
                    setAiUsage(aiUsageData);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message || 'Failed to load admin data.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadAdminData();

        return () => {
            mounted = false;
        };
    }, []);

    const overviewMetrics = useMemo(() => {
        if (!overview) return [];
        return [
            {
                title: 'Total Users',
                value: overview.users?.total ?? '0',
                subtitle: `${overview.users?.active_last_7_days ?? 0} active in last 7 days`,
                variant: 'primary',
            },
            {
                title: 'Question Bank',
                value: overview.questions?.total ?? '0',
                subtitle: `${overview.questions?.pending_review ?? 0} pending review`,
                variant: 'secondary',
            },
            {
                title: 'Attempts',
                value: overview.attempts?.total ?? '0',
                subtitle: `${overview.attempts?.correct ?? 0} marked correct`,
                variant: 'success',
            },
            {
                title: 'AI Answers',
                value: overview.ai_usage?.ai_answered ?? '0',
                subtitle: `Last generated ${formatDateTime(overview.ai_usage?.last_generated_at)}`,
                variant: 'accent',
            },
        ];
    }, [overview]);

    const aiSuccessRate = useMemo(() => {
        if (!aiUsage?.performance?.ai_success_rate) return null;
        return `${Math.round(aiUsage.performance.ai_success_rate * 100)}%`;
    }, [aiUsage]);

    return (
        <div className="admin-dashboard">
            <QuestifyNavBar />

            <section className="admin-hero">
                <Container fluid className="py-4">
                    <Row className="align-items-center g-4">
                        <Col lg={8}>
                            <h1 className="admin-title">Questify Control Centre</h1>
                            <p className="admin-subtitle">
                                Track platform activity in real-time, monitor AI usage, and keep an eye on the
                                health of the question bank.
                            </p>
                            {overview?.generated_at && (
                                <Badge bg="light" text="dark">
                                    Data refreshed {formatDateTime(overview.generated_at)}
                                </Badge>
                            )}
                        </Col>
                        <Col lg={4}>
                            <Card className="highlight-card shadow-sm">
                                <Card.Body>
                                    <Card.Title>Quick Actions</Card.Title>
                                    <ul className="quick-actions list-unstyled mb-0">
                                        <li>• Review pending questions and approve quality content</li>
                                        <li>• Reach out to inactive students to re-engage them</li>
                                        <li>• Investigate AI fallbacks to refine prompts</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            <Container fluid className="py-4">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                        <LoadingSpinner size="lg" text="Fetching admin insights..." />
                    </div>
                ) : (
                    <>
                        <Row className="g-4 mb-4">
                            {overviewMetrics.map((metric) => (
                                <Col key={metric.title} xl={3} sm={6}>
                                    <MetricCard {...metric} />
                                </Col>
                            ))}
                        </Row>

                        <Row className="g-4">
                            <Col xl={8}>
                                <Card className="shadow-sm h-100">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <Card.Title className="mb-0">User Activity (Top {userActivity.limit || 15})</Card.Title>
                                        <Badge bg="primary" pill>
                                            {userActivity.count ?? 0} active users
                                        </Badge>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <div className="table-responsive">
                                            <Table hover className="mb-0 admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>User</th>
                                                        <th className="text-center">Questions</th>
                                                        <th className="text-center">Attempts</th>
                                                        <th>Last Activity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userActivity.results?.length ? (
                                                        userActivity.results.map((entry) => (
                                                            <tr key={entry.user_id}>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-semibold">{entry.display_name}</span>
                                                                        <span className="text-muted small">{entry.email}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center">{entry.total_questions}</td>
                                                                <td className="text-center">{entry.total_attempts}</td>
                                                                <td>{formatDateTime(entry.last_activity)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-4 text-muted">
                                                                No user activity recorded yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xl={4}>
                                <Card className="shadow-sm mb-4">
                                    <Card.Header>
                                        <Card.Title className="mb-0">AI Usage Overview</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <span className="text-muted small d-block">Total short answers</span>
                                                <span className="fs-4 fw-semibold">
                                                    {aiUsage?.totals?.short_answers ?? '0'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">AI populated answers</span>
                                                <span className="fs-4 fw-semibold">
                                                    {aiUsage?.totals?.ai_populated ?? '0'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">Fallback responses</span>
                                                <span className="fs-5">
                                                    {aiUsage?.totals?.fallback_messages ?? 0}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-top">
                                                <span className="text-muted small d-block">AI success rate</span>
                                                <Badge bg="success" pill>
                                                    {aiSuccessRate ?? 'N/A'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">Avg AI answer length</span>
                                                <span className="fs-6">
                                                    {Math.round(aiUsage?.performance?.average_ai_answer_length ?? 0)}{' '}
                                                    characters
                                                </span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="shadow-sm">
                                    <Card.Header>
                                        <Card.Title className="mb-0">Recent AI Explanations</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <div className="recent-ai-list">
                                            {aiUsage?.recent_examples?.length ? (
                                                aiUsage.recent_examples.map((item) => (
                                                    <div key={item.question_id} className="recent-ai-item">
                                                        <div className="recent-ai-meta">
                                                            <span className="recent-ai-question">
                                                                {item.question_text}
                                                            </span>
                                                            <span className="recent-ai-creator text-muted small">
                                                                {item.creator_email}
                                                            </span>
                                                        </div>
                                                        <span className="recent-ai-date text-muted small">
                                                            {formatDateTime(item.created_at)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted mb-0">No AI answers recorded yet.</p>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
};

export default AdminDashboardPage;
