import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { QuestifyNavBar, LoadingSpinner } from '../components/common';
import YourPositionCard from '../components/leaderboard/YourPositionCard';
import Top3Podium from '../components/leaderboard/Top3Podium';
import LeaderboardTabs from '../components/leaderboard/LeaderboardTabs';
import LeaderboardList from '../components/leaderboard/LeaderboardList';
import LeaderboardService from '../services/leaderboardService';
import { getRankBadge, getTabIcon, getTabLabel, getTimeFrameFromTab } from '../utils/leaderboardUtils';
import '../styles/LeaderboardPage.css';

const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('overall');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch leaderboard data
    const fetchLeaderboard = useCallback(async (timeFrame = null) => {
        setLoading(true);
        setError('');

        try {
            const data = await LeaderboardService.fetchLeaderboardData(timeFrame);
            setLeaderboardData(data.leaderboard);
            setMyRank(data.myRank);
        } catch {
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeFrame = getTimeFrameFromTab(activeTab);
        fetchLeaderboard(timeFrame);
    }, [activeTab, fetchLeaderboard]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="leaderboard-page">
            <QuestifyNavBar />

            {/* Main Content */}
            <div className="leaderboard-content">
                <Container>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {/* Your Position Card */}
                    <YourPositionCard
                        myRank={myRank}
                        getRankBadge={getRankBadge}
                    />

                    {/* Top 3 Section */}
                    <Top3Podium
                        leaderboardData={leaderboardData}
                        loading={loading}
                    />

                    {/* Tabs */}
                    <LeaderboardTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />

                    {/* Leaderboard List */}
                    {loading ? (
                        <LoadingSpinner text="Loading leaderboard..." />
                    ) : (
                        <LeaderboardList
                            leaderboardData={leaderboardData}
                            myRank={myRank}
                            activeTab={activeTab}
                            getRankBadge={getRankBadge}
                            getTabIcon={getTabIcon}
                            getTabLabel={getTabLabel}
                        />
                    )}
                </Container>
            </div>
        </div>
    );
};

export default LeaderboardPage;
