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
        <div className="your-position-stats mb-4">
            <h6 className="stats-section-title">
                <i className="bi bi-person-circle me-2"></i>
                My Rankings
            </h6>
            <Row className="g-3">
                {/* Overall Rank Card */}
                <Col xs={6} md={3}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-overall">
                            <i className="bi bi-trophy-fill"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Overall</div>
                            <div className="stat-value">
                                #{myRank.rank} <span className="stat-badge">{getRankBadge(myRank.rank)}</span>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Daily Rank Card */}
                <Col xs={6} md={3}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-daily">
                            <i className="bi bi-sun-fill"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Daily</div>
                            <div className="stat-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.daily ? (
                                    `#${rankData.daily}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Weekly Rank Card */}
                <Col xs={6} md={3}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-weekly">
                            <i className="bi bi-calendar-week-fill"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Weekly</div>
                            <div className="stat-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.weekly ? (
                                    `#${rankData.weekly}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Monthly Rank Card */}
                <Col xs={6} md={3}>
                    <div className="stat-card">
                        <div className="stat-icon stat-icon-monthly">
                            <i className="bi bi-calendar-month-fill"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Monthly</div>
                            <div className="stat-value">
                                {rankData.loading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : rankData.monthly ? (
                                    `#${rankData.monthly}`
                                ) : (
                                    <span className="text-muted">--</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
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
