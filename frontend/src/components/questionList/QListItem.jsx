import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, ListGroupItem } from 'react-bootstrap';

const QListItem = ({
    id,
    title = 'Question Title',
    week = 'Week 0',
    topic = 'Topic 0',
    attempted = false,
    verifyStatus = 'PENDING',
    questionType = 'undefined type',
    rating = 0.0,
    numAttempts = 0,
    isSaved = false,
}) => {
    const navigate = useNavigate();

    // Handle click to navigate to DoQuestion page
    const handleQuestionClick = () => {
        // Navigate to DoQuestion page with question ID as URL parameter
        navigate(`/question/${id}`);
    };

    return (
        <ListGroupItem
            className="p-3 mb-3 border rounded-3 shadow-sm ql-card"
            style={{ cursor: 'pointer' }}
            onClick={handleQuestionClick}
        >
            {/* Title on top, left-aligned */}
            <div className="mb-3" style={{
                lineHeight: '1.5',
                fontSize: '1.2rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                <strong>{title}</strong>
            </div>

            {/* Footer: left chips, right stats */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                {/* Left chips (Week / Type / Topic optional) */}
                <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="badge rounded-pill text-body-secondary border bg-light">{week}</span>
                    <span className="badge rounded-pill text-body-secondary border bg-light">{questionType}</span>
                    <span className="badge rounded-pill text-body-secondary border bg-light d-none d-md-inline">{topic}</span>
                    {verifyStatus === 'APPROVED' && (
                        <span className="text-success small d-none d-md-inline"><i className="bi bi-shield-check me-1"></i>Verified</span>
                    )}
                    {verifyStatus === 'REJECTED' && (
                        <span className="text-danger small d-none d-md-inline"><i className="bi bi-slash-circle me-1"></i>Rejected</span>
                    )}
                </div>

                {/* Right stats (rating / attempts / attempted / saved) */}
                <div className="d-flex align-items-center flex-wrap gap-3 text-muted small">
                    <span><i className="bi bi-star-fill text-warning me-1" aria-hidden="true"></i>{Number(rating).toFixed(1)}</span>
                    <span className="text-secondary">·</span>
                    <span><i className="bi bi-clipboard-check me-1" aria-hidden="true"></i>{numAttempts}</span>
                    {attempted && (
                        <i className="bi bi-check2-circle" title="Attempted" aria-label="Attempted"></i>
                    )}
                    {isSaved && (
                        <i className="bi bi-bookmark-fill text-primary" title="Saved" aria-label="Saved"></i>
                    )}
                </div>
            </div>
        </ListGroupItem>
    );
};

export default QListItem;
