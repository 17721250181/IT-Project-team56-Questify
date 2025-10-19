import React, { useState } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { CommentService } from '../services/commentService';

/**
 * CommentForm Component
 * Allows users to post comments
 */
const CommentForm = ({ questionId, onCommentPosted }) => {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Handle comment submission
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            await CommentService.createComment(questionId, newComment);
            setNewComment('');
            if (onCommentPosted) {
                onCommentPosted(); // Notify parent to refresh comments
            }
        } catch (err) {
            console.error('Failed to submit comment:', err);
            setError('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <h5 className="mb-3">Leave your own feedback</h5>
                    
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setError('')}
                                aria-label="Close"
                            ></button>
                        </div>
                    )}

                    <Form onSubmit={handleSubmitComment}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Type here"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submitting}
                            />
                        </Form.Group>
                        <Button
                            type="submit"
                            variant="dark"
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="me-2"
                                    />
                                    Posting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
    );
};

export default CommentForm;
