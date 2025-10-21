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
 * @param {string} displayMode - 'attempted', 'posted', or 'all'
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
    displayMode,
    onClick,
    borderClass = 'border-secondary'
}) => {
    const isAttempted = displayMode === 'attempted';
    const isPosted = displayMode === 'posted';
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
        if (correct === null) {
            return <Badge bg="secondary" className="small">Short Answer</Badge>;
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
                className={`h-100 ${borderClass} cursor-pointer`}
                style={{ cursor: 'pointer' }}
                onClick={() => onClick(id)}
            >
                <Card.Body>
                    {/* Question Title */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0" style={{ fontSize: '0.9rem' }}>
                            {title}
                        </h6>
                    </div>

                    {/* Badges */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                        {isAttempted && getCorrectnessBadge(isCorrect)}
                        {isPosted && (
                            <>
                                {getTypeBadge(type)}
                                {getStatusBadge(verifyStatus)}
                            </>
                        )}
                        {isAll && getTypeBadge(type)}
                    </div>

                    {/* Additional Info */}
                    {(isPosted || isAll) && (
                        <>
                            {topic && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <i className="bi bi-tag me-1"></i>
                                        {topic}
                                    </small>
                                </div>
                            )}
                            {week && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <i className="bi bi-calendar-week me-1"></i>
                                        {week}
                                    </small>
                                </div>
                            )}
                        </>
                    )}

                    {/* Footer Info */}
                    <div className={`mt-2 ${(isPosted || isAll) ? 'd-flex justify-content-between align-items-center' : ''}`}>
                        <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(date)}
                        </small>
                        {(isPosted || isAll) && numAttempts !== undefined && (
                            <small className="text-muted">
                                <i className="bi bi-pencil-square me-1"></i>
                                {numAttempts} attempts
                            </small>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default QGridCard;
