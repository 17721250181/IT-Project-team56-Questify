import React from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import QuestifyNavBar from '../components/QuestifyNavBar';
import UserProfileHeader from '../components/UserProfileHeader';
import ActivityHeatmap from '../components/ActivityHeatmap';
import QuestionGrid from '../components/questionList/QuestionGrid';

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

                {/* Questions Section with Tabs */}
                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Tabs
                                    defaultActiveKey="attempted"
                                    id="questions-tabs"
                                    className="mb-3"
                                    fill
                                >
                                    <Tab 
                                        eventKey="attempted" 
                                        title={
                                            <span>
                                                <i className="bi bi-pencil-square me-2"></i>
                                                Attempted Questions
                                            </span>
                                        }
                                    >
                                        <QuestionGrid type="attempted" />
                                    </Tab>
                                    <Tab 
                                        eventKey="posted" 
                                        title={
                                            <span>
                                                <i className="bi bi-upload me-2"></i>
                                                Posted Questions
                                            </span>
                                        }
                                    >
                                        <QuestionGrid type="posted" />
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UserProfilePage;
