import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { QuestifyNavBar } from '../components/common';
import { HeroSection, QuickActions, HomeDynamicContent } from '../components/home';
import '../styles/HomePage.css';

/**
 * HomePage - Landing page for authenticated users
 * Displays welcome message, quick actions, and personalized content
 */
const HomePage = () => {
    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-4 mb-5">
                <Row className="justify-content-center">
                    <Col md={11} lg={10}>
                        <HeroSection />
                        <QuickActions />
                        <HomeDynamicContent />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;
