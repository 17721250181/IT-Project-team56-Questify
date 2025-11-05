import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * QuickActions - Display quick action cards for main navigation
 */
const QuickActions = () => {
    const actions = [
        {
            icon: 'bi-grid-3x3-gap-fill',
            iconColor: 'text-primary',
            title: 'Browse',
            description: 'Explore and practice questions.',
            link: '/questions',
            buttonText: 'Go',
            buttonVariant: 'primary',
            buttonClass: 'btn-glow',
        },
        {
            icon: 'bi-bookmark-fill',
            iconColor: 'text-warning',
            title: 'Saved',
            description: 'Jump to your saved questions.',
            link: '/user-profile?tab=saved#questions-tabs-section',
            buttonText: 'Open',
            buttonVariant: 'outline-primary',
            buttonClass: 'btn-glow-outline',
        },
        {
            icon: 'bi-clipboard-check',
            iconColor: 'text-success',
            title: 'My Attempts',
            description: 'Review your recent attempts.',
            link: '/user-profile?tab=attempted#questions-tabs-section',
            buttonText: 'View',
            buttonVariant: 'outline-primary',
            buttonClass: 'btn-glow-outline',
        },
        {
            icon: 'bi-trophy',
            iconColor: 'text-danger',
            title: 'Leaderboard',
            description: "See who's on top this week.",
            link: '/leaderboard',
            buttonText: 'Rankings',
            buttonVariant: 'outline-primary',
            buttonClass: 'btn-glow-outline',
        },
    ];

    return (
        <Row className="g-3 g-md-4 mb-4">
            {actions.map((action, index) => (
                <Col sm={6} lg={3} key={index}>
                    <Card className="h-100 shadow-sm hover-raise fade-in-up">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`bi ${action.icon} ${action.iconColor}`}></i>
                                <Card.Title className="mb-0">{action.title}</Card.Title>
                            </div>
                            <Card.Text className="text-muted small">{action.description}</Card.Text>
                            <Button
                                as={Link}
                                to={action.link}
                                variant={action.buttonVariant}
                                className={`mt-auto ${action.buttonClass}`}
                            >
                                {action.buttonText}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default QuickActions;
