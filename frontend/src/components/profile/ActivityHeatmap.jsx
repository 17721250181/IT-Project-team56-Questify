import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { AttemptService } from '../services/attemptService';
import '../styles/ActivityHeatmap.css';

/**
 * Activity Heatmap Component
 * Displays user's activity history in a GitHub-style heatmap
 */
const ActivityHeatmap = () => {
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AttemptService.getUserActivityHeatmap();
            setActivityData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Generate 365 days grid (52 weeks × 7 days)
    const generateHeatmapGrid = () => {
        if (!activityData) return [];

        const endDate = new Date(activityData.end_date);
        const cells = [];
        
        // Generate past 365 days (12 months)
        for (let i = 364; i >= 0; i--) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = activityData.activity[dateStr] || 0;
            
            cells.push({
                date: dateStr,
                count: count,
                level: getActivityLevel(count)
            });
        }
        
        return cells;
    };

    // Generate month labels based on actual data range
    const generateMonthLabels = (cells) => {
        if (!cells || cells.length === 0) return [];
        
        const monthLabels = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let currentMonth = null;
        let weekIndex = 0;
        
        // Group by weeks and track month changes
        for (let i = 0; i < cells.length; i += 7) {
            const cell = cells[i];
            const date = new Date(cell.date);
            const month = date.getMonth();
            
            // Only add label when month changes and there are at least 2 weeks remaining
            if (currentMonth !== month && (cells.length - i) >= 14) {
                monthLabels.push({
                    month: months[month],
                    weekIndex: weekIndex
                });
                currentMonth = month;
            }
            weekIndex++;
        }
        
        return monthLabels;
    };

    // Determine activity level (0-4) based on count
    const getActivityLevel = (count) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 10) return 3;
        return 4;
    };

    // Get color class based on level
    const getColorClass = (level) => {
        return `activity-level-${level}`;
    };

    // Format date for tooltip
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Group cells by week
    const groupByWeek = (cells) => {
        const weeks = [];
        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
        }
        return weeks;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading activity history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Failed to load activity history: {error}
            </Alert>
        );
    }

    const heatmapCells = generateHeatmapGrid();
    const weeks = groupByWeek(heatmapCells);
    const monthLabels = generateMonthLabels(heatmapCells);

    return (
        <div className="card border-light shadow-sm">
            <div className="card-body">
                <h5 className="card-title mb-2">Activity History</h5>
                
                {/* Stats */}
                <div className="mb-2 text-muted small">
                    <strong>{activityData?.total_attempts || 0}</strong> attempts in the last year
                </div>

                {/* Heatmap Grid */}
                <div className="heatmap-wrapper">
                    {/* Month Labels */}
                    <div className="month-labels">
                        {monthLabels.map((label, idx) => (
                            <span 
                                key={idx} 
                                className="month-label"
                                style={{ 
                                    gridColumnStart: label.weekIndex + 1 
                                }}
                            >
                                {label.month}
                            </span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="heatmap-grid">
                    {/* Day Labels */}
                    <div className="day-labels">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* Cells */}
                    <div className="heatmap-cells">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="heatmap-week">
                                {week.map((cell, dayIdx) => (
                                    <div
                                        key={`${weekIdx}-${dayIdx}`}
                                        className={`heatmap-cell ${getColorClass(cell.level)}`}
                                        title={`${formatDate(cell.date)}: ${cell.count} attempts`}
                                        data-date={cell.date}
                                        data-count={cell.count}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                    {/* Legend */}
                    <div className="heatmap-legend">
                        <span className="legend-label">Less</span>
                        {[0, 1, 2, 3, 4].map(level => (
                            <div 
                                key={level} 
                                className={`legend-cell ${getColorClass(level)}`}
                                title={`Level ${level}`}
                            />
                        ))}
                        <span className="legend-label">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
