import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Spinner, Alert } from 'react-bootstrap';
import QuestifyNavBar from '../components/QuestifyNavBar';
import LoadingSpinner from '../components/LoadingSpinner';
import apiClient from '../services/apiClient';
import '../styles/LeaderboardPage.css';

const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('overall');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch leaderboard data
    const fetchLeaderboard = useCallback(async (timeFrame = null) => {
        setLoading(true);
        setError('');
        
        try {
            // Build query parameters based on timeframe
            let params = {};
            if (timeFrame) {
                const now = new Date();
                let fromDate;
                
                if (timeFrame === 'daily') {
                    fromDate = new Date(now.setHours(0, 0, 0, 0));
                } else if (timeFrame === 'weekly') {
                    fromDate = new Date(now.setDate(now.getDate() - 7));
                } else if (timeFrame === 'monthly') {
                    fromDate = new Date(now.setMonth(now.getMonth() - 1));
                }
                
                if (fromDate) {
                    params.from = fromDate.toISOString().split('T')[0];
                }
            }

            // Fetch full leaderboard
            const leaderboardResponse = await apiClient.get('/leaderboard/', { params });

            // Fetch my rank
            const myRankResponse = await apiClient.get('/leaderboard/me/', { params });

            setLeaderboardData(leaderboardResponse.data.results || []);
            setMyRank(myRankResponse.data);
            
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch leaderboard:', err);
            }
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeFrameMap = {
            'overall': null,
            'daily': 'daily',
            'weekly': 'weekly',
            'monthly': 'monthly'
        };
        
        fetchLeaderboard(timeFrameMap[activeTab]);
    }, [activeTab, fetchLeaderboard]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const getTabLabel = (tab) => {
        switch(tab) {
            case 'overall': return 'Overall';
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
            default: return tab;
        }
    };

    const getTabIcon = (tab) => {
        switch(tab) {
            case 'overall': return 'bi-trophy';
            case 'daily': return 'bi-sun';
            case 'weekly': return 'bi-calendar-week';
            case 'monthly': return 'bi-calendar-month';
            default: return '';
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const getTop3 = () => {
        return leaderboardData.slice(0, 3);
    };

    return (
        <>
            <QuestifyNavBar />
            <hr />
            <Container className="leaderboard-page mt-4">
                <h1 className="text-center mb-4">
                    <i className="bi bi-trophy-fill text-warning me-2"></i>
                    Leaderboard
                </h1>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Your Position Card */}
                {myRank && myRank.me && (
                    <Card className="mb-4 your-position-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-1">
                                        <i className="bi bi-person-circle me-2"></i>
                                        Your Position
                                    </h5>
                                    <div className="position-details">
                                        <span className="rank-badge">
                                            {getRankBadge(myRank.me.rank)}
                                        </span>
                                        <span className="ms-3">
                                            <strong>Overall:</strong> #{myRank.me.rank}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="score-display">
                                        <div className="score-label">Score</div>
                                        <div className="score-value">{myRank.me.points}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-row mt-3">
                                <div className="stat-item">
                                    <i className="bi bi-sun-fill text-warning"></i>
                                    <span>Daily: {activeTab === 'daily' ? `#${myRank.me.rank}` : 'xx'}</span>
                                </div>
                                <div className="stat-item">
                                    <i className="bi bi-calendar-week-fill text-primary"></i>
                                    <span>Weekly: {activeTab === 'weekly' ? `#${myRank.me.rank}` : 'xx'}</span>
                                </div>
                                <div className="stat-item">
                                    <i className="bi bi-calendar-month-fill text-info"></i>
                                    <span>Monthly: {activeTab === 'monthly' ? `#${myRank.me.rank}` : 'xx'}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Top 3 Section */}
                {!loading && leaderboardData.length >= 3 && (
                    <div className="top-3-section mb-4">
                        <h4 className="text-center mb-3">
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            Top 3
                        </h4>
                        <Row className="justify-content-center">
                            {/* 2nd Place */}
                            <Col xs={12} md={4} className="mb-3 order-md-1">
                                <Card className="top-card rank-2">
                                    <Card.Body className="text-center">
                                        <div className="rank-medal">🥈</div>
                                        <div className="user-avatar mb-2">
                                            <i className="bi bi-person-circle"></i>
                                        </div>
                                        <h5>{getTop3()[1]?.username || 'Username'}</h5>
                                        <p className="score-text">{getTop3()[1]?.points || 0} pts</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* 1st Place (Center, larger) */}
                            <Col xs={12} md={4} className="mb-3 order-md-2">
                                <Card className="top-card rank-1">
                                    <Card.Body className="text-center">
                                        <div className="rank-medal">🥇</div>
                                        <div className="user-avatar mb-2">
                                            <i className="bi bi-person-circle"></i>
                                        </div>
                                        <h5>{getTop3()[0]?.username || 'Username'}</h5>
                                        <p className="score-text">{getTop3()[0]?.points || 0} pts</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* 3rd Place */}
                            <Col xs={12} md={4} className="mb-3 order-md-3">
                                <Card className="top-card rank-3">
                                    <Card.Body className="text-center">
                                        <div className="rank-medal">🥉</div>
                                        <div className="user-avatar mb-2">
                                            <i className="bi bi-person-circle"></i>
                                        </div>
                                        <h5>{getTop3()[2]?.username || 'Username'}</h5>
                                        <p className="score-text">{getTop3()[2]?.points || 0} pts</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}

                {/* Tabs */}
                <Nav variant="tabs" className="mb-3 leaderboard-tabs">
                    {['overall', 'daily', 'weekly', 'monthly'].map(tab => (
                        <Nav.Item key={tab}>
                            <Nav.Link
                                active={activeTab === tab}
                                onClick={() => handleTabChange(tab)}
                            >
                                <i className={`bi ${getTabIcon(tab)} me-2`}></i>
                                {getTabLabel(tab)}
                            </Nav.Link>
                        </Nav.Item>
                    ))}
                </Nav>

                {/* Leaderboard Lists */}
                {loading ? (
                    <LoadingSpinner text="Loading leaderboard..." />
                ) : (
                    <Row>
                        <Col xs={12}>
                            <Card className="leaderboard-list-card">
                                <Card.Header>
                                    <i className={`bi ${getTabIcon(activeTab)} me-2`}></i>
                                    {getTabLabel(activeTab)} Rankings
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {leaderboardData.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-inbox display-1 text-muted"></i>
                                            <p className="mt-3 text-muted">No rankings available yet</p>
                                        </div>
                                    ) : (
                                        <div className="leaderboard-list">
                                            {leaderboardData.map((user) => (
                                                <div 
                                                    key={user.user_id} 
                                                    className={`leaderboard-item ${myRank?.me?.user_id === user.user_id ? 'current-user' : ''}`}
                                                >
                                                    <div className="rank-column">
                                                        <span className="rank-number">
                                                            {getRankBadge(user.rank)}
                                                        </span>
                                                    </div>
                                                    <div className="user-column">
                                                        <div className="user-avatar-sm">
                                                            <i className="bi bi-person-circle"></i>
                                                        </div>
                                                        <div className="user-info">
                                                            <div className="username">{user.username}</div>
                                                            <div className="user-stats">
                                                                <span className="stat">
                                                                    <i className="bi bi-check-circle text-success"></i> {user.correct}
                                                                </span>
                                                                <span className="stat ms-2">
                                                                    <i className="bi bi-clipboard-check"></i> {user.attempts}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="score-column">
                                                        <div className="score-value">{user.points}</div>
                                                        <div className="score-label">Score</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </>
    );
};

export default LeaderboardPage;
