// Importing the React-Bootstrap components
import { Container, Row, Col } from 'react-bootstrap';

// Importing custom components
import { QuestifyNavBar } from '../components/common';
import QuestionList from '../components/questionList/QuestionList';
import '../styles/QuestionListLayout.css';

const QuestionListPage = () => {
    return (
        <>
            <QuestifyNavBar />
            <Container className="mt-4 mb-4">
                <Row className="justify-content-center">
                    <Col md={11} lg={9} xl={8}>
                        <div className="question-list-header mb-4">
                            <div className="title-badge">
                                <i className="bi bi-grid-3x3-gap-fill"></i>
                            </div>
                            <h1 className="question-list-title">Question List</h1>
                        </div>
                        <QuestionList title={null} />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default QuestionListPage;
