import React from 'react';
import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * YourPositionCard Component
 * Displays the current user's position in the leaderboard
 * 
 * @param {Object} myRank - User's rank data
 * @param {string} activeTab - Current active time filter tab
 * @param {Function} getRankBadge - Function to get rank badge/emoji
 */
const YourPositionCard = ({ myRank, activeTab, getRankBadge }) => {
    if (!myRank || !myRank.me) {
        return null;
    }

    return (
        <Card className="mb-4 your-position-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            Your Position
                        </h5>
                        <div className="position-details">
                            <span className="rank-badge">
                                {getRankBadge(myRank.me.rank)}
                            </span>
                            <span className="ms-3">
                                <strong>Overall:</strong> #{myRank.me.rank}
                            </span>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="score-display">
                            <div className="score-label">Score</div>
                            <div className="score-value">{myRank.me.points}</div>
                        </div>
                    </div>
                </div>
                <div className="stats-row mt-3">
                    <div className="stat-item">
                        <i className="bi bi-sun-fill text-warning"></i>
                        <span>Daily: {activeTab === 'daily' ? `#${myRank.me.rank}` : 'xx'}</span>
                    </div>
                    <div className="stat-item">
                        <i className="bi bi-calendar-week-fill text-primary"></i>
                        <span>Weekly: {activeTab === 'weekly' ? `#${myRank.me.rank}` : 'xx'}</span>
                    </div>
                    <div className="stat-item">
                        <i className="bi bi-calendar-month-fill text-info"></i>
                        <span>Monthly: {activeTab === 'monthly' ? `#${myRank.me.rank}` : 'xx'}</span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

YourPositionCard.propTypes = {
    myRank: PropTypes.shape({
        me: PropTypes.shape({
            rank: PropTypes.number.isRequired,
            points: PropTypes.number.isRequired,
            username: PropTypes.string.isRequired,
        }),
    }),
    activeTab: PropTypes.string.isRequired,
    getRankBadge: PropTypes.func.isRequired,
};

export default YourPositionCard;
