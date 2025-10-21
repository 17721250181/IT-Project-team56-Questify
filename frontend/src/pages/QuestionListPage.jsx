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
                <Row>
                    <Col align="center">
                        <h1>Question List</h1>
                        <div className="border rounded-4 p-2 bg-body-tertiary mb-3">
                            <QuestionList title={null} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default QuestionListPage;
