import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PostQuestionForm from '../components/PostQuestionForm.jsx';

const PostQuestionPage = () => {
    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    <PostQuestionForm />
                </Col>
            </Row>
        </Container>
    );
};

export default PostQuestionPage;