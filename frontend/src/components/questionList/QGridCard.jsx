import React from 'react';
import { Badge, Card } from 'react-bootstrap';

/**
 * Grid Card Component
 * Card layout for displaying questions in grid mode
 *
 * @param {string} id - Question ID
 * @param {string} title - Question text/title
 * @param {string} type - Question type ('MCQ', 'SHORT', etc.)
 * @param {string} week - Week information
 * @param {string} topic - Topic information
 * @param {string} verifyStatus - Verification status ('APPROVED', 'REJECTED', 'PENDING')
 * @param {boolean|null} isCorrect - For attempted questions: true/false/null
 * @param {string} date - Date string (created_at or submitted_at)
 * @param {number} numAttempts - Number of attempts (for posted/all questions)
 * @param {number} rating - Question rating (for posted/all questions)
 * @param {string} displayMode - 'attempted', 'posted', 'saved', or 'all'
 * @param {function} onClick - Click handler
 * @param {string} borderClass - CSS class for border styling
 */
const QGridCard = ({
    id,
    title = 'Question',
    type,
    week,
    topic,
    verifyStatus,
    isCorrect,
    date,
    numAttempts,
    rating = 0,
    displayMode,
    onClick,
    borderClass = 'border-secondary'
}) => {
    const isAttempted = displayMode === 'attempted';
    const isPosted = displayMode === 'posted';
    const isSaved = displayMode === 'saved';
    const isAll = displayMode === 'all';

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format week to ensure consistent display (remove spaces)
    const formatWeek = (weekString) => {
        if (!weekString) return '';
        // Remove spaces between "Week" and number to ensure consistency
        // "Week 5" -> "Week5", "Week 10" -> "Week10"
        return weekString.replace(/^Week\s+(\d+)$/, 'Week$1');
    };

    // Badge helper functions
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Badge bg="success"><i className="bi bi-check-circle me-1"></i>Approved</Badge>;
            case 'REJECTED':
                return <Badge bg="danger"><i className="bi bi-x-circle me-1"></i>Rejected</Badge>;
            case 'PENDING':
            default:
                return <Badge bg="warning" text="dark"><i className="bi bi-clock me-1"></i>Pending</Badge>;
        }
    };

    const getTypeBadge = (questionType) => {
        switch (questionType) {
            case 'MCQ':
                return <Badge bg="primary">Multiple Choice</Badge>;
            case 'SHORT':
                return <Badge bg="info">Short Answer</Badge>;
            default:
                return <Badge bg="secondary">{questionType}</Badge>;
        }
    };

    const getCorrectnessBadge = (correct) => {
        // Only show correctness badge for MCQ (correct is boolean)
        // For Short Answer (correct is null), don't show badge here
        if (correct === null) {
            return null;
        } else if (correct) {
            return (
                <Badge bg="success" className="small">
                    <i className="bi bi-check-circle me-1"></i>
                    Correct
                </Badge>
            );
        } else {
            return (
                <Badge bg="danger" className="small">
                    <i className="bi bi-x-circle me-1"></i>
                    Incorrect
                </Badge>
            );
        }
    };

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <Card
                className={`h-100 ${borderClass} cursor-pointer shadow-sm`}
                style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => onClick(id)}
            >
                <Card.Body className="d-flex flex-column">
                    {/* Question Title */}
                    <div className="mb-2">
                        <h6
                            className="card-title mb-0"
                            style={{
                                fontSize: '0.9rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word'
                            }}
                        >
                            {title}
                        </h6>
                    </div>

                    {/* Badges */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                        {isAttempted && (
                            <>
                                {getCorrectnessBadge(isCorrect)}
                                {type && getTypeBadge(type)}
                            </>
                        )}
                        {isPosted && (
                            <>
                                {getTypeBadge(type)}
                                {getStatusBadge(verifyStatus)}
                            </>
                        )}
                        {isSaved && (
                            <>
                                {getTypeBadge(type)}
                                {getStatusBadge(verifyStatus)}
                            </>
                        )}
                        {isAll && getTypeBadge(type)}
                    </div>

                    {/* Additional Info */}
                    {(isPosted || isAll || isSaved) && (
                        <div className="mt-auto">
                            {topic && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        <i className="bi bi-tag me-1"></i>
                                        {topic}
                                    </small>
                                </div>
                            )}

                            {/* Bottom Row: Week on left, Rating and Attempts on right */}
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <div>
                                    {week && (
                                        <small className="text-muted">
                                            <i className="bi bi-calendar-week me-1"></i>
                                            {formatWeek(week)}
                                        </small>
                                    )}
                                </div>

                                {/* Right: Rating and Attempts */}
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <span title="Rating">
                                        <i className="bi bi-star-fill text-warning me-1"></i>
                                        {Number(rating).toFixed(1)}
                                    </span>
                                    <span title="Attempts">
                                        <i className="bi bi-pencil-square me-1"></i>
                                        {numAttempts ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Info for Attempted Questions */}
                    {isAttempted && (
                        <div className="mt-auto">
                            {topic && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        <i className="bi bi-tag me-1"></i>
                                        {topic}
                                    </small>
                                </div>
                            )}

                            {/* Bottom Row: Week on left, Date on right */}
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <div>
                                    {week && (
                                        <small className="text-muted">
                                            <i className="bi bi-calendar-week me-1"></i>
                                            {formatWeek(week)}
                                        </small>
                                    )}
                                </div>

                                {/* Right: Date */}
                                {date && (
                                    <div>
                                        <small className="text-muted">
                                            <i className="bi bi-clock me-1"></i>
                                            {formatDate(date)}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default QGridCard;
