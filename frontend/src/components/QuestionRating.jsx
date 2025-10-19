import React, { useState, useEffect } from 'react';
import { Card, Button, Row } from 'react-bootstrap';
import { RatingService } from '../services/ratingService';

/**
 * QuestionRating Component
 * Displays question rating and allows users to rate questions
 * Note: Ratings are permanent and cannot be changed after submission
 */
const QuestionRating = ({ questionId }) => {
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedRating, setSelectedRating] = useState(null);

    useEffect(() => {
        loadQuestionRating();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId]);

    const loadQuestionRating = async () => {
        try {
            const data = await RatingService.getQuestionRating(questionId);
            setAverageRating(data?.average || 0);
            setRatingCount(data?.count || 0);
            setUserRating(data?.userRating ?? null);
            setError('');
        } catch (err) {
            console.error('Failed to load question rating:', err);
            setError('Failed to load rating information. Please refresh and try again.');
        }
    };

    const handleRatingClick = (value) => {
        // If user already rated, don't allow changes
        if (userRating !== null) {
            return;
        }
        
        if (isSubmitting) return;

        // Set selected rating for confirmation
        setSelectedRating(value);
        setError('');
    };

    const handleConfirmRating = async () => {
        if (!selectedRating || isSubmitting) return;

        setIsSubmitting(true);
        
        try {
            const data = await RatingService.rateQuestion(questionId, selectedRating);
            setAverageRating(data?.average || selectedRating);
            setRatingCount(data?.count || 1);
            setUserRating(data?.userRating ?? selectedRating);
            setError('');
            setSelectedRating(null);
        } catch (err) {
            console.error('Failed to submit rating:', err);
            setError('Unable to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRating = () => {
        setSelectedRating(null);
        setError('');
    };

    const renderStars = () => {
        const isDisabled = userRating !== null || isSubmitting || selectedRating !== null;
        const displayRating = hoveredRating || selectedRating || userRating || 0;
        
        return (
            <div className="d-flex align-items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi ${
                            star <= displayRating
                                ? 'bi-star-fill text-warning'
                                : 'bi-star'
                        }`}
                        style={{ 
                            fontSize: '1.5rem', 
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.6 : 1 
                        }}
                        onMouseEnter={() => !isDisabled && setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleRatingClick(star)}
                        title={userRating !== null ? 'You have already rated this question' : ''}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Question Rating</h5>
                </div>
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div>
                        <div className="fw-bold" style={{ fontSize: '2rem' }}>
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="text-muted small">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={star}
                                    className={`bi ${
                                        star <= Math.round(averageRating)
                                            ? 'bi-star-fill text-warning'
                                            : 'bi-star'
                                    }`}
                                ></i>
                            ))}
                        </div>
                        <div className="text-muted small">
                            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-danger small mb-2">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {error}
                    </div>
                )}

                <div className="mt-3">
                    <p className="mb-2 small text-muted">
                        {userRating === null ? 'Rate this question:' : 'Question rating:'}
                    </p>
                    {renderStars()}

                    {/* Confirmation buttons appear after selecting a rating */}
                    {selectedRating !== null && userRating === null && (
                        <div className="mt-3 p-3 bg-light border rounded">
                            <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
                                <div className="flex-grow-1">
                                    <strong className="text-warning me-2">
                                        {selectedRating} {selectedRating === 1 ? 'Star' : 'Stars'}
                                    </strong>
                                    <br />
                                    <span className="small text-muted">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Rating can not be changed
                                    </span>
                                </div>
                                <div className="d-flex flex-column flex-sm-row gap-2 align-self-stretch align-self-lg-auto">
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={handleConfirmRating}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Confirm'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={handleCancelRating}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {userRating === null && selectedRating === null && (
                        <div className="small text-muted mt-2">
                            <i className="bi bi-info-circle me-1"></i>
                            Click a star to rate
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default QuestionRating;
