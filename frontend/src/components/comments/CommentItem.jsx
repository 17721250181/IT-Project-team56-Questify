import React, { useState } from 'react';
import { Card, Button, Form, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CommentService } from '../services/commentService';

/**
 * SingleComment Component (Reusable comment/reply display component)
 * Displays a single comment or reply with likes and reply functionality
 * 
 * @param {Object} comment - Comment or reply data object
 * @param {Function} onCommentUpdate - Callback function to refresh comments
 * @param {boolean} isReply - Whether this is a reply (affects styling)
 * @param {number} parentCommentId - Parent comment ID (the root comment ID for nested replies)
 */
const SingleComment = ({ comment, onCommentUpdate, isReply = false, parentCommentId = null }) => {
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

    // Handle reply submission (for both main comments and replies)
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || isSubmittingReply) return;

        setIsSubmittingReply(true);
        try {
            // For nested replies, use the parent comment ID (root comment)
            // For main comments, use the comment's own ID
            const targetId = parentCommentId || comment.id;
            
            // Add @mention prefix when replying to a reply
            const finalContent = isReply 
                ? `@${authorDisplayName}: ${replyContent}`
                : replyContent;
            
            await CommentService.replyToComment(targetId, finalContent);
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

    // Determine styles based on whether this is a reply
    const cardClassName = isReply ? 'border-0 bg-light' : 'border-0 shadow-sm';
    const bodyClassName = isReply ? 'py-2' : '';
    const avatarSize = isReply ? 35 : 40;
    const nameClassName = isReply ? 'fw-bold small' : 'fw-bold';
    const dateClassName = isReply ? 'text-muted' : 'text-muted';
    const dateStyle = isReply ? { fontSize: '0.75rem' } : {};
    const contentClassName = isReply ? 'small mb-1' : 'mb-2';
    const actionSizeClass = isReply ? 'small' : '';

    const author = comment.author || {};
    const authorDisplayName = author.display_name || author.name || 'User';
    const profileHref = author.id ? `/users/${author.id}` : null;

    const renderAuthorHeader = () => {
        const avatarElement = author.profile_image ? (
            <Image
                src={author.profile_image}
                roundedCircle
                width={avatarSize}
                height={avatarSize}
                className="me-2"
            />
        ) : (
            <i
                className="bi bi-person-circle text-secondary me-2"
                style={{ fontSize: `${avatarSize}px` }}
            />
        );

        const nameBlock = (
            <div>
                <div className={nameClassName}>{authorDisplayName}</div>
                <small className={dateClassName} style={dateStyle}>
                    {formatDate(comment.created_at)}
                </small>
            </div>
        );

        if (!profileHref) {
            return (
                <div className="d-flex align-items-center">
                    {avatarElement}
                    {nameBlock}
                </div>
            );
        }

        return (
            <Link
                to={profileHref}
                className="d-flex align-items-center text-decoration-none text-reset"
            >
                {avatarElement}
                {nameBlock}
            </Link>
        );
    };

    return (
        <Card className={cardClassName}>
            <Card.Body className={bodyClassName}>
                {/* Comment/Reply Header */}
                <div className="d-flex align-items-center mb-2">
                    {renderAuthorHeader()}
                </div>

                {/* Comment/Reply Content */}
                <Card.Text className={contentClassName}>{comment.content}</Card.Text>

                {/* Comment/Reply Actions */}
                <div className="d-flex gap-3 align-items-center">
                    <Button
                        variant="link"
                        size="sm"
                        className={`p-0 text-decoration-none ${actionSizeClass}`}
                        onClick={handleLikeToggle}
                        disabled={isLiking}
                    >
                        <i className={`bi ${comment.is_liked_by_user ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                        {comment.like_count > 0 && <span className="ms-1">{comment.like_count}</span>}
                    </Button>
                    
                    {/* Reply button */}
                    <Button
                        variant="link"
                        size="sm"
                        className={`p-0 text-decoration-none ${actionSizeClass}`}
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
                                placeholder={isReply 
                                    ? `Reply to ${authorDisplayName}...` 
                                    : "Write a reply..."}
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

                {/* Replies (only main comments display reply list) */}
                {!isReply && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ms-4">
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className="mb-2">
                                <SingleComment
                                    comment={reply}
                                    onCommentUpdate={onCommentUpdate}
                                    isReply={true}
                                    parentCommentId={comment.id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

/**
 * CommentItem Component (Main comment container component)
 * Wrapper component for displaying a top-level comment with its replies
 */
const CommentItem = ({ comment, onCommentUpdate }) => {

    return (
        <div className="mb-3">
            <SingleComment 
                comment={comment} 
                onCommentUpdate={onCommentUpdate} 
                isReply={false}
            />
        </div>
    );
};

export default CommentItem;
