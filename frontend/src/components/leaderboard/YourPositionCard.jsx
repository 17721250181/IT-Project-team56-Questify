import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import LeaderboardService from '../../services/leaderboardService';

/**
 * YourPositionCard Component
 * Displays the current user's position in the leaderboard across different time frames
 * 
 * @param {Object} myRank - User's rank data for current active tab
 * @param {Function} getRankBadge - Function to get rank badge/emoji
 */
const YourPositionCard = ({ myRank, getRankBadge }) => {
    const [rankData, setRankData] = useState({
        daily: null,
        weekly: null,
        monthly: null,
        loading: true
    });

    // Fetch ranks for all time frames
    useEffect(() => {
        const fetchAllRanks = async () => {
            try {
                const [daily, weekly, monthly] = await Promise.all([
                    LeaderboardService.getMyRank('daily').catch(() => null),
                    LeaderboardService.getMyRank('weekly').catch(() => null),
                    LeaderboardService.getMyRank('monthly').catch(() => null)
                ]);

                setRankData({
                    daily: daily?.rank || null,
                    weekly: weekly?.rank || null,
                    monthly: monthly?.rank || null,
                    loading: false
                });
            } catch (error) {
                console.error('Failed to fetch time-based ranks:', error);
                setRankData({
                    daily: null,
                    weekly: null,
                    monthly: null,
                    loading: false
                });
            }
        };

        fetchAllRanks();
    }, []);

    // Check if myRank data exists
    if (!myRank || !myRank.rank) {
        return null;
    }

    return (
        <Card className="mb-4 your-position-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-1">
                            <i className="bi bi-person-circle me-2"></i>
                            Your Position
                        </h5>
                        <div className="position-details">
                            <span className="rank-badge">
                                {getRankBadge(myRank.rank)}
                            </span>
                            <span className="ms-3">
                                <strong>Overall:</strong> #{myRank.rank}
                            </span>
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="score-display">
                            <div className="score-label">Score</div>
                            <div className="score-value">{myRank.points}</div>
                        </div>
                    </div>
                </div>

                {/* Time-based rankings */}
                <Row className="mt-3 pt-3 border-top">
                    <Col xs={4} className="text-center">
                        <div className="time-rank-item">
                            <i className="bi bi-sun-fill text-warning mb-1"></i>
                            <div className="time-rank-label">Daily</div>
                            <div className="time-rank-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.daily ? (
                                    `#${rankData.daily}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </Col>
                    <Col xs={4} className="text-center">
                        <div className="time-rank-item">
                            <i className="bi bi-calendar-week-fill text-primary mb-1"></i>
                            <div className="time-rank-label">Weekly</div>
                            <div className="time-rank-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.weekly ? (
                                    `#${rankData.weekly}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </Col>
                    <Col xs={4} className="text-center">
                        <div className="time-rank-item">
                            <i className="bi bi-calendar-month-fill text-info mb-1"></i>
                            <div className="time-rank-label">Monthly</div>
                            <div className="time-rank-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.monthly ? (
                                    `#${rankData.monthly}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

YourPositionCard.propTypes = {
    myRank: PropTypes.shape({
        rank: PropTypes.number.isRequired,
        points: PropTypes.number.isRequired,
        display_name: PropTypes.string.isRequired,
        user_id: PropTypes.number,
        attempts: PropTypes.number,
        correct: PropTypes.number,
    }),
    getRankBadge: PropTypes.func.isRequired,
};

export default YourPositionCard;
