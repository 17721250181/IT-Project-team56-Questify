import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { QuestionService } from '../services/QuestionService';

/**
 * QuestionRating Component
 * Displays question rating and allows users to rate questions
 */
const QuestionRating = ({ questionId }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(0);

    useEffect(() => {
        loadQuestionRating();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId]);

    const loadQuestionRating = async () => {
        try {
            const question = await QuestionService.getQuestionById(questionId);
            setCurrentRating(question.rating || 0);
        } catch (err) {
            console.error('Failed to load question rating:', err);
        }
    };

    // Handle rating submission
    const handleRatingClick = async (value) => {
        setRating(value);
        try {
            // You may need to implement a rating endpoint in the backend
            // For now, this is a placeholder
            console.log('Rating submitted:', value);
            // await QuestionService.rateQuestion(questionId, value);
            // await loadQuestionRating();
        } catch (err) {
            console.error('Failed to submit rating:', err);
        }
    };

    // Render star rating
    const renderStars = () => {
        return (
            <div className="d-flex align-items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi ${
                            star <= (hoveredRating || rating)
                                ? 'bi-star-fill text-warning'
                                : 'bi-star'
                        }`}
                        style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleRatingClick(star)}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <h5 className="mb-3">Question Rating</h5>
                <div className="d-flex align-items-center gap-3 mb-2">
                    <div>
                        <div className="fw-bold" style={{ fontSize: '2rem' }}>
                            {currentRating.toFixed(1)}
                        </div>
                        <div className="text-muted small">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={star}
                                    className={`bi ${
                                        star <= Math.round(currentRating)
                                            ? 'bi-star-fill text-warning'
                                            : 'bi-star'
                                    }`}
                                ></i>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <p className="mb-2 small text-muted">Rate this question:</p>
                    {renderStars()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default QuestionRating;
