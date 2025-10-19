import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner } from 'react-bootstrap';
import CommentItem from './CommentItem';
import { CommentService } from '../../services/commentService';

/**
 * CommentList Component
 * Displays all comments for a question
 */
const CommentList = ({ questionId, refreshTrigger }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId, refreshTrigger]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await CommentService.getComments(questionId);
            setComments(data);
            setError('');
        } catch (err) {
            console.error('Failed to load comments:', err);
            setError('Failed to load comments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comment-list-section">
            <Card className="shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">
                        Comments
                        <span className="badge bg-secondary ms-2">{comments.length}</span>
                    </h5>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {/* Comments List */}
                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading comments...</span>
                            </Spinner>
                        </div>
                    ) : comments.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-chat-dots me-2"></i>
                            No comments yet. Be the first to comment!
                        </Alert>
                    ) : (
                        <div>
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onCommentUpdate={loadComments}
                                />
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CommentList;
