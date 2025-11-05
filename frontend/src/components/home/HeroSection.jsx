import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AttemptService } from '../../services/attemptService';

/**
 * HeroSection - Main welcome banner for the home page
 */
const HeroSection = () => {
    const { user } = useAuth();
    const [streakData, setStreakData] = useState(null);
    const [loadingStreak, setLoadingStreak] = useState(true);

    useEffect(() => {
        let active = true;
        const loadStreak = async () => {
            try {
                setLoadingStreak(true);
                const data = await AttemptService.getUserStreak();
                if (!active) return;
                setStreakData(data);
            } catch {
                if (!active) return;
                setStreakData(null);
            } finally {
                if (active) setLoadingStreak(false);
            }
        };
        
        if (user) {
            loadStreak();
        }
        
        return () => {
            active = false;
        };
    }, [user]);

    return (
        <Card className="border-0 shadow-sm mb-4 home-hero fade-in">
            <Card.Body className="py-4 py-md-5">
                <Row className="align-items-center">
                    <Col md={7} className="text-center text-md-start">
                        <div className="mb-2 text-muted">
                            Welcome back{user ? `, ${user.display_name || user.email}` : ''}
                        </div>
                        <h1 className="fw-bold" style={{ letterSpacing: '-0.02em' }}>
                            Practice smarter. Discuss deeper.
                        </h1>
                        <p className="text-muted mb-4">
                            Browse questions, track your progress, and learn with peers.
                        </p>
                        <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                            <Button as={Link} to="/questions" variant="primary" className="btn-glow">
                                Start Practicing
                            </Button>
                            <Button
                                as={Link}
                                to="/user-profile"
                                variant="outline-primary"
                                className="btn-glow-outline"
                            >
                                View Profile
                            </Button>
                        </div>
                    </Col>
                    <Col md={5} className="d-none d-md-block">
                        <div className="p-4 bg-white rounded-4 shadow-sm h-100 d-flex align-items-center justify-content-center icon-float">
                            {loadingStreak ? (
                                <div className="text-center">
                                    <Spinner animation="border" size="sm" variant="primary" />
                                    <div className="mt-2 small text-muted">Loading...</div>
                                </div>
                            ) : streakData ? (
                                <div className="text-center">
                                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                        <i
                                            className={`bi ${
                                                streakData.has_attempted_today
                                                    ? 'bi-fire'
                                                    : 'bi-hourglass-split'
                                            }`}
                                            style={{
                                                fontSize: '2rem',
                                                color: streakData.has_attempted_today
                                                    ? '#f97316'
                                                    : '#3b82f6',
                                            }}
                                        ></i>
                                        <div className="fw-bold" style={{ fontSize: '2rem' }}>
                                            {streakData.current_streak}
                                        </div>
                                    </div>
                                    <div className="small text-muted">
                                        {streakData.current_streak === 1
                                            ? 'day streak'
                                            : 'days streak'}
                                    </div>
                                    <div className="mt-2 small text-muted">
                                        {streakData.has_attempted_today ? (
                                            <span className="text-success">
                                                ✓ {streakData.today_count}{' '}
                                                {streakData.today_count === 1
                                                    ? 'question'
                                                    : 'questions'}{' '}
                                                today
                                            </span>
                                        ) : (
                                            <span className="text-warning">
                                                No attempts today yet
                                            </span>
                                        )}
                                    </div>
                                    {streakData.longest_streak > streakData.current_streak && (
                                        <div className="mt-1 small text-muted">
                                            <i className="bi bi-trophy-fill text-warning me-1"></i>
                                            Best: {streakData.longest_streak} days
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i
                                        className="bi bi-calendar-check"
                                        style={{ fontSize: '2rem', color: '#3b82f6' }}
                                    ></i>
                                    <div className="mt-2 small text-muted">
                                        Start your streak today!
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default HeroSection;
