import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, ListGroupItem, Row, Col } from 'react-bootstrap';

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
}) => {
    const navigate = useNavigate();

    // Handle click to navigate to DoQuestion page
    const handleQuestionClick = () => {
        // Navigate to DoQuestion page with question ID as URL parameter
        navigate(`/question/${id}`);
    };

    return (
        <ListGroupItem
            className="p-1 border-bottom"
            style={{ cursor: 'pointer' }}
            onClick={handleQuestionClick}
        >
            <Row className="align-items-center">
                {/* Title Area */}
                <Col xs={12} md={6} lg={4} className="text-start">
                    <h6 
                        className="mb-1 mb-md-0" 
                        style={{ 
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {title}
                    </h6>
                </Col>

                {/* Rating information Area */}
                <Col xs={12} md={6} lg={3} className="text-start text-md-end order-lg-3">
                    <div>
                        <Badge className="m-1" bg="info">
                            Rating: {rating}
                        </Badge>
                        <Badge className="m-1" bg="info">
                            Total Attempts: {numAttempts}
                        </Badge>
                    </div>
                </Col>

                {/* Question Tags Area */}
                <Col xs={12} md={12} lg={5} className="text-start">
                    <div>
                        <Badge className="m-1" bg="secondary">
                            {week}
                        </Badge>
                        <Badge className="m-1" bg="secondary">
                            {questionType}
                        </Badge>
                        <Badge className="m-1" bg="secondary">
                            {topic}
                        </Badge>
                        {verifyStatus === 'APPROVED' ? (
                            <Badge className="m-1" bg="success">
                                Verified
                            </Badge>
                        ) : verifyStatus === 'REJECTED' ? (
                            <Badge className="m-1" bg="danger">
                                Rejected
                            </Badge>
                        ) : null}
                        {attempted ? (
                            <Badge className="m-1" bg="secondary">
                                Attempted
                            </Badge>
                        ) : null}
                    </div>
                </Col>
            </Row>
        </ListGroupItem>
    );
};

export default QListItem;
