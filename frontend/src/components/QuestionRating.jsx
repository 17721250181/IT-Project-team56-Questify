import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { QuestionService } from '../services/QuestionService';

/**
 * QuestionRating Component
 * Displays question rating and allows users to rate questions
 */
const QuestionRating = ({ questionId }) => {
    const [averageRating, setAverageRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [userRating, setUserRating] = useState(null);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadQuestionRating();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId]);

    const loadQuestionRating = async () => {
        try {
            const data = await QuestionService.getQuestionRating(questionId);
            setAverageRating(data?.average || 0);
            setRatingCount(data?.count || 0);
            setUserRating(data?.userRating ?? null);
            setError('');
        } catch (err) {
            console.error('Failed to load question rating:', err);
            setError('Failed to load rating information. Please refresh and try again.');
        }
    };

    const handleRatingClick = async (value) => {
        if (isSubmitting || value === userRating) return;

        const previousRating = userRating;
        setUserRating(value);
        setIsSubmitting(true);
        try {
            const data = await QuestionService.rateQuestion(questionId, value);
            setAverageRating(data?.average || value);
            setRatingCount(data?.count || 1);
            setUserRating(data?.userRating ?? value);
            setError('');
        } catch (err) {
            console.error('Failed to submit rating:', err);
            setUserRating(previousRating);
            setError('Unable to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearRating = async () => {
        if (isSubmitting || userRating === null) return;
        const previousRating = userRating;
        setIsSubmitting(true);
        try {
            await QuestionService.clearRating(questionId);
            await loadQuestionRating();
        } catch (err) {
            console.error('Failed to clear rating:', err);
            setUserRating(previousRating);
            setError('Unable to clear rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => (
        <div className="d-flex align-items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={`bi ${
                        star <= (hoveredRating || userRating || 0)
                            ? 'bi-star-fill text-warning'
                            : 'bi-star'
                    }`}
                    style={{ fontSize: '1.5rem', cursor: 'pointer', opacity: isSubmitting ? 0.5 : 1 }}
                    onMouseEnter={() => !isSubmitting && setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => handleRatingClick(star)}
                ></i>
            ))}
        </div>
    );

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Question Rating</h5>
                    {userRating !== null && (
                        <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={handleClearRating}
                            disabled={isSubmitting}
                        >
                            Clear Rating
                        </Button>
                    )}
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

                {userRating !== null && (
                    <div className="mb-3 text-muted small">
                        Your rating: <strong>{userRating}</strong>
                    </div>
                )}
                {error && (
                    <div className="text-danger small mb-2">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {error}
                    </div>
                )}

                <div className="mt-3">
                    <p className="mb-2 small text-muted">Rate this question:</p>
                    {renderStars()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default QuestionRating;
