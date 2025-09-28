// Importing the React-Bootstrap components
import { Container, Row, Col } from 'react-bootstrap';

// Importing custom components
import QuestifyNavBar from '../components/QuestifyNavBar.jsx';
import QuestionList from '../components/QuestionList.jsx';

const QuestionListPage = () => {
  return (
    <>
      <QuestifyNavBar />
      <hr />
      <Container className='mt-3'>
        <Row>
          <Col align='center'>
            <QuestionList />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default QuestionListPage;
