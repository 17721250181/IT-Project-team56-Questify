import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import QuestifyNavBar from '../components/QuestifyNavBar.jsx';
import DoQuestion from '../components/DoQuestion.jsx';

const DoQuestionPage = () => {
    // Get question ID from URL parameters using React Router
    const { questionId } = useParams();
    const id = parseInt(questionId) || 1;

    return (
        <>
            <QuestifyNavBar />
            <hr />
            <Container className="mt-3">
                <Row>
                    <Col align="center" xs={12} md={8}>
                        <DoQuestion questionId={id} />
                    </Col>
                    <Col align="center" xs={12} md={4}>
                        <h2>Comments</h2>
                        {/* <CommentSection /> */}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DoQuestionPage;
