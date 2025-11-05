import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * HeroSection - Main welcome banner for the home page
 */
const HeroSection = () => {
    const { user } = useAuth();

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
                            <div className="text-center">
                                <i
                                    className="bi bi-magic"
                                    style={{ fontSize: '2rem', color: '#3b82f6' }}
                                ></i>
                                <div className="mt-2 small text-muted">Keep up the streak!</div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default HeroSection;
