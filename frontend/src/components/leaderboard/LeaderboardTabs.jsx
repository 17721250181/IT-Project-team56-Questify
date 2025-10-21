import React from 'react';
import { Nav } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * LeaderboardTabs Component
 * Navigation tabs for different time frames
 * 
 * @param {string} activeTab - Currently active tab
 * @param {Function} onTabChange - Handler for tab change
 */
const LeaderboardTabs = ({ activeTab, onTabChange }) => {
    const tabs = ['overall', 'daily', 'weekly', 'monthly'];

    const getTabLabel = (tab) => {
        switch(tab) {
            case 'overall': return 'Overall';
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
            default: return tab;
        }
    };

    const getTabIcon = (tab) => {
        switch(tab) {
            case 'overall': return 'bi-trophy';
            case 'daily': return 'bi-sun';
            case 'weekly': return 'bi-calendar-week';
            case 'monthly': return 'bi-calendar-month';
            default: return '';
        }
    };

    return (
        <Nav variant="tabs" className="mb-3 leaderboard-tabs">
            {tabs.map(tab => (
                <Nav.Item key={tab}>
                    <Nav.Link
                        active={activeTab === tab}
                        onClick={() => onTabChange(tab)}
                    >
                        <i className={`bi ${getTabIcon(tab)} me-2`}></i>
                        {getTabLabel(tab)}
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
};

LeaderboardTabs.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};

export default LeaderboardTabs;
