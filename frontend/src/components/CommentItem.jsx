import React, { useState } from 'react';
import { Card, Button, Form, Image } from 'react-bootstrap';
import { CommentService } from '../services/commentService';

/**
 * CommentItem Component
 * Displays a single comment with replies, likes, and reply functionality
 */
const CommentItem = ({ comment, onCommentUpdate }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Handle like/unlike
    const handleLikeToggle = async () => {
        if (isLiking) return;
        
        setIsLiking(true);
        try {
            if (comment.is_liked_by_user) {
                await CommentService.unlikeComment(comment.id);
            } else {
                await CommentService.likeComment(comment.id);
            }
            onCommentUpdate(); // Refresh comments
        } catch (error) {
            console.error('Failed to toggle like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    // Handle reply submission
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || isSubmittingReply) return;

        setIsSubmittingReply(true);
        try {
            await CommentService.replyToComment(comment.id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
            onCommentUpdate(); // Refresh comments
        } catch (error) {
            console.error('Failed to submit reply:', error);
            alert('Failed to post reply. Please try again.');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className="mb-3">
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {/* Comment Header */}
                    <div className="d-flex align-items-center mb-2">
                        {comment.author.profile_image ? (
                            <Image
                                src={comment.author.profile_image}
                                roundedCircle
                                width={40}
                                height={40}
                                className="me-2"
                            />
                        ) : (
                            <i className="bi bi-person-circle text-secondary me-2" style={{ fontSize: '40px' }} />
                        )}
                        <div>
                            <div className="fw-bold">{comment.author.name}</div>
                            <small className="text-muted">{formatDate(comment.created_at)}</small>
                        </div>
                    </div>

                    {/* Comment Content */}
                    <Card.Text className="mb-2">{comment.content}</Card.Text>

                    {/* Comment Actions */}
                    <div className="d-flex gap-3 align-items-center">
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={handleLikeToggle}
                            disabled={isLiking}
                        >
                            <i className={`bi ${comment.is_liked_by_user ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                            {comment.like_count > 0 && <span className="ms-1">{comment.like_count}</span>}
                        </Button>
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            <i className="bi bi-reply"></i> Reply
                        </Button>
                    </div>

                    {/* Reply Form */}
                    {showReplyForm && (
                        <Form onSubmit={handleReplySubmit} className="mt-3">
                            <Form.Group>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    disabled={isSubmittingReply}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2 mt-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="primary"
                                    disabled={!replyContent.trim() || isSubmittingReply}
                                >
                                    {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyContent('');
                                    }}
                                    disabled={isSubmittingReply}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ms-4">
                            {comment.replies.map((reply) => (
                                <Card key={reply.id} className="mb-2 border-0 bg-light">
                                    <Card.Body className="py-2">
                                        <div className="d-flex align-items-center mb-1">
                                            {reply.author.profile_image ? (
                                                <Image
                                                    src={reply.author.profile_image}
                                                    roundedCircle
                                                    width={35}
                                                    height={35}
                                                    className="me-2"
                                                />
                                            ) : (
                                                <i className="bi bi-person-circle text-secondary me-2" style={{ fontSize: '35px' }} />
                                            )}
                                            <div>
                                                <div className="fw-bold small">{reply.author.name}</div>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {formatDate(reply.created_at)}
                                                </small>
                                            </div>
                                        </div>
                                        <Card.Text className="small mb-1">{reply.content}</Card.Text>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-0 text-decoration-none small"
                                            onClick={async () => {
                                                try {
                                                    if (reply.is_liked_by_user) {
                                                        await CommentService.unlikeComment(reply.id);
                                                    } else {
                                                        await CommentService.likeComment(reply.id);
                                                    }
                                                    onCommentUpdate();
                                                } catch (error) {
                                                    console.error('Failed to toggle like:', error);
                                                }
                                            }}
                                        >
                                            <i className={`bi ${reply.is_liked_by_user ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                                            {reply.like_count > 0 && <span className="ms-1">{reply.like_count}</span>}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CommentItem;
