import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Top3Podium Component
 * Displays the top 3 users in a podium-style layout
 * 
 * @param {Array} leaderboardData - Array of user ranking data
 * @param {boolean} loading - Loading state
 */
const Top3Podium = ({ leaderboardData, loading }) => {
    // Don't show if still loading or less than 3 users
    if (loading || leaderboardData.length < 3) {
        return null;
    }

    const getTop3 = () => {
        return leaderboardData.slice(0, 3);
    };

    const top3 = getTop3();

    return (
        <div className="top-3-section mb-4">
            <h4 className="text-center mb-3">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Top 3
            </h4>
            <Row className="justify-content-center">
                {/* 2nd Place */}
                <Col xs={12} md={4} className="mb-3 order-md-1">
                    <Card className="top-card rank-2">
                        <Card.Body className="text-center">
                            <div className="rank-medal">🥈</div>
                            <div className="user-avatar mb-2">
                                <i className="bi bi-person-circle"></i>
                            </div>
                            <h5>{top3[1]?.display_name || 'User'}</h5>
                            <p className="score-text">{top3[1]?.points || 0} pts</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 1st Place (Center, larger) */}
                <Col xs={12} md={4} className="mb-3 order-md-2">
                    <Card className="top-card rank-1">
                        <Card.Body className="text-center">
                            <div className="rank-medal">🥇</div>
                            <div className="user-avatar mb-2">
                                <i className="bi bi-person-circle"></i>
                            </div>
                            <h5>{top3[0]?.display_name || 'User'}</h5>
                            <p className="score-text">{top3[0]?.points || 0} pts</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 3rd Place */}
                <Col xs={12} md={4} className="mb-3 order-md-3">
                    <Card className="top-card rank-3">
                        <Card.Body className="text-center">
                            <div className="rank-medal">🥉</div>
                            <div className="user-avatar mb-2">
                                <i className="bi bi-person-circle"></i>
                            </div>
                            <h5>{top3[2]?.display_name || 'User'}</h5>
                            <p className="score-text">{top3[2]?.points || 0} pts</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

Top3Podium.propTypes = {
    leaderboardData: PropTypes.arrayOf(
        PropTypes.shape({
            user_id: PropTypes.number.isRequired,
            display_name: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            rank: PropTypes.number.isRequired,
        })
    ).isRequired,
    loading: PropTypes.bool.isRequired,
};

export default Top3Podium;
