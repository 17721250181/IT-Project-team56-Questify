// Importing the React-Bootstrap components
import { Container, Row, Col } from 'react-bootstrap';

// Importing custom components
import { QuestifyNavBar } from '../components/common';
import QuestionList from '../components/questionList/QuestionList';

const QuestionListPage = () => {
    return (
        <>
            <QuestifyNavBar />
            <hr />
            <Container className="mt-3">
                <Row className="justify-content-center">
                    <Col md={11} lg={9} xl={8}>
                        <h1 className="text-center">Question List</h1>
                        <QuestionList title={null} />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default QuestionListPage;
