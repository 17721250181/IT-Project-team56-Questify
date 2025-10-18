import React, {useState, useEffect} from 'react';
import { Row, Col, Image, Badge, Form } from 'react-bootstrap';
import { AuthService } from '../services/authService';

/**
 * User Profile Header Component
 * Displays user avatar, username, and statistics
 */
const UserProfileHeader = ({ user }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Extract user data with fallbacks
    const username = user?.name || user?.full_name || user?.email || 'User';
    const points = user?.points ?? 'N/A';
    const ranking = user?.ranking ?? 'N/A';
    const attemptedQuestions = user?.attempted_questions ?? 'N/A';
    const email = user?.email || 'Not available';
    const studentId = user?.student_id || 'N/A';
    
    useEffect(() => {
        const fetchProfile = async () => {
        try {
            const data = await AuthService.getProfilePict();
            setAvatarUrl(data.profile_picture_url);
            console.log(data.profile_picture_url);
        } catch (err) {
            console.error('Failed to load profile picture:', err);
        }
        };
            fetchProfile();
        }, []);

        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setIsUploading(true);

            const formData = new FormData();
            formData.append("profile_picture", file);

            try {
                const data = await AuthService.setProfilePict(formData);
                setAvatarUrl(`${data.profile_picture_url}?t=${Date.now()}`);
            } catch (err) {
                alert(err.message);
            } finally {
                setIsUploading(false);
            }
        };

    return (
        <div className="bg-light border rounded-3 p-4 shadow-sm">
            <Row className="align-items-center">
                {/* User Avatar */}
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
                                objectFit: "cover",
                                objectPosition: "center 10%",
                             }}
                        />
                    ) : (
                        <i 
                            className="bi bi-person-circle text-secondary"
                            style={{ fontSize: '150px' }}
                        />
                    )}
                    {/* Change picture button */}
                    <Form.Group controlId="formFile" className="d-flex justify-content-center mt-3">
                        <Form.Label
                            className="btn btn-outline-primary btn-sm m-0"
                            style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
                        >
                            {isUploading ? "Uploading..." : "Change Picture"}
                            <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                            disabled={isUploading}
                            />
                        </Form.Label>
                    </Form.Group>
                </Col>

                {/* User Information */}
                <Col xs={12} md={9}>
                    <div>
                        {/* Username */}
                        <h2 className="mb-3">{username}</h2>

                        {/* Statistics */}
                        <div className="mb-3">
                            <Row>
                                <Col xs={12} sm={6} md={4} className="mb-2">
                                    <div>
                                        <Badge bg="primary" className="mb-1">Points</Badge>
                                        <div className="fw-bold">{points}</div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={4} className="mb-2">
                                    <div>
                                        <Badge bg="success" className="mb-1">Ranking</Badge>
                                        <div className="fw-bold">{ranking}</div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={4} className="mb-2">
                                    <div>
                                        <Badge bg="info" className="mb-1">Attempted</Badge>
                                        <div className="fw-bold">{attemptedQuestions} questions</div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Additional Info */}
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
