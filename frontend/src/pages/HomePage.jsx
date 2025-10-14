import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import QuestifyNavBar from '../components/QuestifyNavBar';
import { useAuth } from '../contexts/AuthContext';

/**
 * Home Page - Landing page for authenticated users
 * Placeholder for future development
 */
const HomePage = () => {
    const { user } = useAuth();

    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        {/* Welcome Section */}
                        <div className="text-center mb-5">
                            <h1 className="display-4 mb-3">Welcome to Questify!</h1>
                            {user && (
                                <p className="lead text-muted">
                                    Hello, <strong>{user.name || user.email}</strong>
                                </p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <Row className="g-4">
                            <Col md={6}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>Browse Questions</Card.Title>
                                        <Card.Text>
                                            Explore and practice with questions created by students and teaching staff.
                                        </Card.Text>
                                        <Button
                                            as={Link}
                                            to="/questions"
                                            variant="primary"
                                            className="mt-auto"
                                        >
                                            Go to Questions
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>Your Profile</Card.Title>
                                        <Card.Text>
                                            View your progress, attempted questions, and activity history.
                                        </Card.Text>
                                        <Button
                                            as={Link}
                                            to="/profile"
                                            variant="outline-primary"
                                            className="mt-auto"
                                        >
                                            View Profile
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>Create Question</Card.Title>
                                        <Card.Text>
                                            Contribute to the question bank by creating your own questions.
                                        </Card.Text>
                                        <Button
                                            as={Link}
                                            to="/post-question"
                                            variant="outline-primary"
                                            className="mt-auto"
                                        >
                                            Create Question
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>Leaderboard</Card.Title>
                                        <Card.Text>
                                            Check out the rankings and see how you compare with other students.
                                        </Card.Text>
                                        <Button
                                            as={Link}
                                            to="/leaderboard"
                                            variant="outline-primary"
                                            className="mt-auto"
                                        >
                                            View Leaderboard
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Placeholder Notice */}
                        <div className="alert alert-info mt-5 text-center">
                            <strong>Note:</strong> This is a placeholder homepage. More features coming soon!
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;
