import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { QuestifyNavBar } from '../components/common';
import { UserProfileHeader, ActivityHeatmap } from '../components/profile';
import QuestionGrid from '../components/questionList/QuestionGrid';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';

const UserProfilePage = () => {
    const { user: currentUser, checkAuthStatus } = useAuth();
    const { userId } = useParams();

    const viewingUserId = userId ? Number(userId) : currentUser?.id ?? null;
    const isOwnProfile = !userId || (currentUser && Number(userId) === currentUser.id);

    const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
    const [loading, setLoading] = useState(!isOwnProfile);
    const [error, setError] = useState(null);

    const refreshCurrentUser = useCallback(async () => {
        await checkAuthStatus();
    }, [checkAuthStatus]);

    const loadProfile = useCallback(async () => {
        if (!viewingUserId) {
            return;
        }

        if (isOwnProfile) {
            setProfileUser(currentUser);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await AuthService.getUserById(viewingUserId);
            setProfileUser(data);
        } catch (err) {
            setError(err.message || 'Failed to load user profile.');
            setProfileUser(null);
        } finally {
            setLoading(false);
        }
    }, [isOwnProfile, currentUser, viewingUserId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        if (isOwnProfile) {
            setProfileUser(currentUser);
        }
    }, [currentUser, isOwnProfile]);

    const handleProfileUpdated = async (updatedUser) => {
        if (isOwnProfile) {
            if (!updatedUser) {
                await refreshCurrentUser();
            } else {
                setProfileUser(updatedUser);
            }
        } else if (updatedUser) {
            setProfileUser(updatedUser);
        } else {
            await loadProfile();
        }
    };

    if (loading || (!profileUser && !error)) {
        return (
            <>
                <QuestifyNavBar />
                <Container className="py-5 text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading profile...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Loading profile...</p>
                </Container>
            </>
        );
    }

    if (error || !profileUser) {
        return (
            <>
                <QuestifyNavBar />
                <Container className="py-5">
                    <Alert variant="danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error || 'Unable to load this profile.'}
                    </Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-4 mb-5">
                <Row className="mb-4">
                    <Col>
                        <UserProfileHeader
                            user={profileUser}
                            isEditable={isOwnProfile}
                            onProfileUpdated={handleProfileUpdated}
                        />
                    </Col>
                </Row>

                {isOwnProfile && (
                    <Row className="mb-4">
                        <Col>
                            <ActivityHeatmap />
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <Card className="shadow-sm">
                            <Card.Body>
                                {isOwnProfile ? (
                                    <Tabs defaultActiveKey="attempted" id="questions-tabs" className="mb-3" fill>
                                        <Tab
                                            eventKey="attempted"
                                            title={
                                                <span>
                                                    <i className="bi bi-pencil-square me-2"></i>
                                                    Attempted Questions
                                                </span>
                                            }
                                        >
                                            <QuestionGrid
                                                type="attempted"
                                                ownerId={isOwnProfile ? null : profileUser?.id}
                                                isOwnProfile={isOwnProfile}
                                            />
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
                                            <QuestionGrid
                                                type="posted"
                                                ownerId={profileUser?.id}
                                                isOwnProfile={isOwnProfile}
                                            />
                                        </Tab>
                                    </Tabs>
                                ) : (
                                    <div>
                                        <h5 className="mb-3">
                                            <i className="bi bi-upload me-2"></i>
                                            Questions Posted
                                        </h5>
                                        <QuestionGrid
                                            type="posted"
                                            ownerId={profileUser?.id}
                                            isOwnProfile={false}
                                        />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UserProfilePage;
