import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PostQuestionForm from '../components/PostQuestionForm.jsx';
import { QuestifyNavBar } from '../components/common';
import '../styles/PostQuestionPage.css';

const PostQuestionPage = () => {
    return (
        <div className="post-question-page">
            <QuestifyNavBar />

            {/* Balanced Modern Header */}
            <div className="post-question-header">
                <Container>
                    <div className="post-question-header-content">
                        <div className="post-question-header-icon">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                        <h1 className="post-question-header-title">Post Question</h1>
                    </div>
                </Container>
            </div>

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