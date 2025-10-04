import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import QuestifyNavBar from '../components/QuestifyNavBar';
import UserProfileHeader from '../components/UserProfileHeader';
import ActivityHeatmap from '../components/ActivityHeatmap';
import AttemptedQuestions from '../components/AttemptedQuestions';

/**
 * User Profile Page
 * Displays user information, activity history, and attempted questions
 */
const UserProfilePage = () => {
    const { user } = useAuth();

    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-4 mb-5">
                {/* User Profile Header Section */}
                <Row className="mb-4">
                    <Col>
                        <UserProfileHeader user={user} />
                    </Col>
                </Row>

                {/* Activity History Section */}
                <Row className="mb-4">
                    <Col>
                        <ActivityHeatmap userId={user?.id} />
                    </Col>
                </Row>

                {/* Attempted Questions Section */}
                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h4 className="mb-3">Attempted Questions:</h4>
                                <AttemptedQuestions userId={user?.id} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UserProfilePage;
