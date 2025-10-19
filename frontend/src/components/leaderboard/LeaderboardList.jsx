import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * LeaderboardList Component
 * Displays the ranked list of users
 * 
 * @param {Array} leaderboardData - Array of user ranking data
 * @param {Object} myRank - Current user's rank data
 * @param {string} activeTab - Current active tab
 * @param {Function} getRankBadge - Function to get rank badge/emoji
 * @param {Function} getTabIcon - Function to get tab icon
 * @param {Function} getTabLabel - Function to get tab label
 */
const LeaderboardList = ({ 
    leaderboardData, 
    myRank, 
    activeTab, 
    getRankBadge,
    getTabIcon,
    getTabLabel 
}) => {
    return (
        <Row>
            <Col xs={12}>
                <Card className="leaderboard-list-card">
                    <Card.Header>
                        <i className={`bi ${getTabIcon(activeTab)} me-2`}></i>
                        {getTabLabel(activeTab)} Rankings
                    </Card.Header>
                    <Card.Body className="p-0">
                        {leaderboardData.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-inbox display-1 text-muted"></i>
                                <p className="mt-3 text-muted">No rankings available yet</p>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboardData.map((user) => (
                                    <div 
                                        key={user.user_id} 
                                        className={`leaderboard-item ${myRank?.me?.user_id === user.user_id ? 'current-user' : ''}`}
                                    >
                                        <div className="rank-column">
                                            <span className="rank-number">
                                                {getRankBadge(user.rank)}
                                            </span>
                                        </div>
                                        <div className="user-column">
                                            <div className="user-avatar-sm">
                                                <i className="bi bi-person-circle"></i>
                                            </div>
                                            <div className="user-info">
                                                <div className="username">{user.username}</div>
                                                <div className="user-stats">
                                                    <span className="stat">
                                                        <i className="bi bi-check-circle text-success"></i> {user.correct}
                                                    </span>
                                                    <span className="stat ms-2">
                                                        <i className="bi bi-clipboard-check"></i> {user.attempts}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="score-column">
                                            <div className="score-value">{user.points}</div>
                                            <div className="score-label">Score</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

LeaderboardList.propTypes = {
    leaderboardData: PropTypes.arrayOf(
        PropTypes.shape({
            user_id: PropTypes.number.isRequired,
            username: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            rank: PropTypes.number.isRequired,
            attempts: PropTypes.number.isRequired,
            correct: PropTypes.number.isRequired,
        })
    ).isRequired,
    myRank: PropTypes.shape({
        me: PropTypes.shape({
            user_id: PropTypes.number.isRequired,
        }),
    }),
    activeTab: PropTypes.string.isRequired,
    getRankBadge: PropTypes.func.isRequired,
    getTabIcon: PropTypes.func.isRequired,
    getTabLabel: PropTypes.func.isRequired,
};

export default LeaderboardList;
