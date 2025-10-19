import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Image, Badge, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { AuthService } from '../services/authService';

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

    const username = useMemo(() => {
        return user?.name || user?.full_name || user?.email || 'User';
    }, [user]);

    const email = user?.email || 'Not available';
    const studentId = user?.student_id || 'N/A';
    const points = user?.points ?? 'N/A';
    const ranking = user?.ranking ?? 'N/A';
    const attemptedQuestions = user?.attempted_questions ?? 'N/A';
    const postedQuestions = user?.posted_questions ?? 'N/A';

    useEffect(() => {
        setNameInput(username);
        setAvatarUrl(user?.profile_picture_url || null);
        setFeedback(null);
    }, [user, username]);

    useEffect(() => {
        if (!isEditable) return;
        let ignore = false;
        const fetchProfile = async () => {
            try {
                const data = await AuthService.getProfilePict();
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
            const data = await AuthService.setProfilePict(formData);
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
            setFeedback({ type: 'warning', message: 'Name cannot be empty.' });
            return;
        }

        if (trimmed === username) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        setFeedback(null);
        try {
            const updatedUser = await AuthService.updateProfile({ name: trimmed });
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
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            roundedCircle
                            width={150}
                            height={150}
                            alt={username}
                            className="border border-3 border-primary object-cover"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center 10%',
                            }}
                        />
                    ) : (
                        <i
                            className="bi bi-person-circle text-secondary"
                            style={{ fontSize: '150px' }}
                        />
                    )}
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
                                                setNameInput(username);
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
                                    <h2 className="mb-0">{username}</h2>
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
                                    <Badge bg="primary" className="mb-1">Points</Badge>
                                    <div className="fw-bold">{points}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <Badge bg="success" className="mb-1">Ranking</Badge>
                                    <div className="fw-bold">{ranking ?? 'N/A'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <Badge bg="info" className="mb-1">Attempted</Badge>
                                    <div className="fw-bold">{attemptedQuestions} questions</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} className="mb-2">
                                    <Badge bg="warning" className="mb-1">Posted</Badge>
                                    <div className="fw-bold">{postedQuestions} questions</div>
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
