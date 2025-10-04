import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PostQuestionForm from '../components/PostQuestionForm.jsx';

const PostQuestionPage = () => {
    return (
        <>
            <QuestifyNavBar />
            <hr />
                <Container className="mt-3">
                    <Row className="justify-content-center">
                        <Col lg={8} md={10}>
                            <PostQuestionForm />
                        </Col>
                    </Row>
                </Container>
        </>
    );
};

export default PostQuestionPage;