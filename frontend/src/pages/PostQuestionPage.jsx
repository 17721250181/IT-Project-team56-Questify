import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PostQuestionForm from '../components/PostQuestionForm.jsx';
import { QuestifyNavBar } from '../components/common';
import '../styles/PostQuestionPage.css';

const PostQuestionPage = () => {
    return (
        <div className="post-question-page">
            <QuestifyNavBar />

            {/* Main Content */}
            <div className="post-question-content">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} md={10}>
                            <div className="post-question-form-card">
                                <PostQuestionForm />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default PostQuestionPage;