import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Badge, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { AuthService } from '../../services/authService';
import { UserProfileService } from '../../services/userProfileService';
import { UserAvatar } from '../common';
import '../../styles/UserProfileHeader.css';

/**
 * User Profile Header Component
 * Displays user avatar, username, and statistics
 */
const UserProfileHeader = ({ user, isEditable = false, onProfileUpdated }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [userStats, setUserStats] = useState({ points: 0, ranking: null });

    const displayName = useMemo(() => {
        return user?.display_name || user?.name || user?.full_name || user?.email || 'User';
    }, [user]);

    const email = user?.email || 'Not available';
    const studentId = user?.student_id || 'N/A';
    const points = userStats.points ?? user?.points ?? 0;
    const ranking = userStats.ranking ?? user?.ranking ?? null;
    const attemptedQuestions = user?.attempted_questions ?? 0;
    const postedQuestions = user?.posted_questions ?? 0;

    useEffect(() => {
        setNameInput(displayName);
        setAvatarUrl(user?.profile_picture_url || null);
        setFeedback(null);
    }, [user, displayName]);

    // Fetch user statistics (points and ranking) from leaderboard
    useEffect(() => {
        if (!isEditable) return;
        
        let ignore = false;
        const fetchUserStats = async () => {
            try {
                const stats = await AuthService.getUserStats();
                if (!ignore) {
                    setUserStats({
                        points: stats.points ?? 0,
                        ranking: stats.ranking ?? null
                    });
                }
            } catch (err) {
                console.error('Failed to load user stats:', err);
                // Keep default values on error
            }
        };
        
        fetchUserStats();
        return () => {
            ignore = true;
        };
    }, [isEditable, user?.id]);

    useEffect(() => {
        if (!isEditable) return;
        let ignore = false;
        const fetchProfile = async () => {
            try {
                const data = await UserProfileService.getProfilePicture();
                if (!ignore) {
                    setAvatarUrl(data.profile_picture_url || null);
                }
            } catch (err) {
                console.error('Failed to load profile picture:', err);
            }
        };
        fetchProfile();
        return () => {
            ignore = true;
        };
    }, [isEditable]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        setFeedback(null);

        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const data = await UserProfileService.setProfilePicture(formData);
            const newUrl = `${data.profile_picture_url}?t=${Date.now()}`;
            setAvatarUrl(newUrl);
            onProfileUpdated?.();
        } catch (err) {
            setFeedback({ type: 'danger', message: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleNameSave = async (event) => {
        event.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed) {
            setFeedback({ type: 'warning', message: 'Display name cannot be empty.' });
            return;
        }

        if (trimmed === displayName) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        setFeedback(null);
        try {
            const updatedUser = await UserProfileService.updateProfile({ display_name: trimmed });
            onProfileUpdated?.(updatedUser);
            setIsEditingName(false);
        } catch (err) {
            setFeedback({ type: 'danger', message: err.message });
        } finally {
            setIsSavingName(false);
        }
    };

    return (
        <div className="bg-light border rounded-3 p-4 shadow-sm">
            <Row className="align-items-center">
                <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                    <UserAvatar
                        avatarUrl={avatarUrl}
                        size="xlarge"
                        showBorder={true}
                        hoverable={isEditable}
                    />
                    {isEditable && (
                        <Form.Group controlId="formFile" className="d-flex justify-content-center mt-3">
                            <Form.Label
                                className="btn btn-outline-primary btn-sm m-0"
                                style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                            >
                                {isUploading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Change Picture'
                                )}
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    hidden
                                    disabled={isUploading}
                                />
                            </Form.Label>
                        </Form.Group>
                    )}
                </Col>

                <Col xs={12} md={9}>
                    <div className="d-flex flex-column gap-3">
                        <div>
                            {isEditingName && isEditable ? (
                                <Form onSubmit={handleNameSave} className="d-flex flex-column flex-sm-row gap-2">
                                    <Form.Control
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Enter your display name"
                                        disabled={isSavingName}
                                    />
                                    <div className="d-flex gap-2">
                                        <Button type="submit" variant="primary" disabled={isSavingName}>
                                            {isSavingName ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setNameInput(displayName);
                                                setIsEditingName(false);
                                                setFeedback(null);
                                            }}
                                            disabled={isSavingName}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            ) : (
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <h2 className="mb-0">{displayName}</h2>
                                    {isEditable && (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setIsEditingName(true)}
                                        >
                                            Edit Name
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {feedback && (
                            <Alert
                                variant={feedback.type}
                                onClose={() => setFeedback(null)}
                                dismissible
                                className="py-2"
                            >
                                {feedback.message}
                            </Alert>
                        )}

                        <div className="mb-3">
                            <Row>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <div className="stat-card">
                                        <Badge bg="primary" className="mb-1">
                                            <i className="bi bi-star-fill me-1"></i>
                                            Points
                                        </Badge>
                                        <div className="fw-bold fs-5">{points}</div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <div className="stat-card">
                                        <Badge bg="success" className="mb-1">
                                            <i className="bi bi-trophy-fill me-1"></i>
                                            Ranking
                                        </Badge>
                                        <div className="fw-bold fs-5">
                                            {ranking != null ? `#${ranking}` : <span className="text-muted">Unranked</span>}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <div className="stat-card">
                                        <Badge bg="info" className="mb-1">
                                            <i className="bi bi-check-circle-fill me-1"></i>
                                            Attempted
                                        </Badge>
                                        <div className="fw-bold">{attemptedQuestions} questions</div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <div className="stat-card">
                                        <Badge bg="warning" className="mb-1">
                                            <i className="bi bi-pencil-square me-1"></i>
                                            Posted
                                        </Badge>
                                        <div className="fw-bold">{postedQuestions} questions</div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <div className="text-muted small">
                            <div className="mb-1">
                                <strong>Email:</strong> {email}
                            </div>
                            <div>
                                <strong>Student ID:</strong> {studentId}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default UserProfileHeader;
