import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { QuestifyNavBar } from '../components/common';
import { UserProfileHeader, ActivityHeatmap } from '../components/profile';
import QuestionGrid from '../components/questionList/QuestionGrid';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfileService';
import '../styles/UserProfilePage.css';

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
            const data = await UserProfileService.getUserById(viewingUserId);
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
                <Container className="profile-loading">
                    <Spinner animation="border" role="status" className="profile-loading-spinner">
                        <span className="visually-hidden">Loading profile...</span>
                    </Spinner>
                    <p className="profile-loading-text">Loading profile...</p>
                </Container>
            </>
        );
    }

    if (error || !profileUser) {
        return (
            <>
                <QuestifyNavBar />
                <Container className="profile-error">
                    <Alert variant="danger" className="profile-error-alert">
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
            <Container className="profile-page-container">
                <Row className="profile-section">
                    <Col>
                        <UserProfileHeader
                            user={profileUser}
                            isEditable={isOwnProfile}
                            onProfileUpdated={handleProfileUpdated}
                        />
                    </Col>
                </Row>

                {isOwnProfile && (
                    <Row className="profile-section">
                        <Col>
                            <ActivityHeatmap />
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col>
                        <Card className="profile-card">
                            <Card.Body>
                                {isOwnProfile ? (
                                    <Tabs defaultActiveKey="attempted" id="questions-tabs" className="profile-tabs mb-3" fill>
                                        <Tab
                                            eventKey="attempted"
                                            title={
                                                <span className="profile-tab-label">
                                                    <i className="bi bi-pencil-square profile-tab-icon"></i>
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
                                                <span className="profile-tab-label">
                                                    <i className="bi bi-upload profile-tab-icon"></i>
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
                                        <h5 className="profile-section-heading">
                                            <i className="bi bi-upload profile-tab-icon"></i>
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
