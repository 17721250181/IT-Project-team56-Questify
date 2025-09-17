import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing the React-Bootstrap components
import {Container, Row, Col} from 'react-bootstrap';

// Importing custom components
import QuestifyNavBar from './components/QuestifyNavBar.jsx';
import QuestionList from './components/QuestionList.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuestifyNavBar />
    <hr />
    <Container className='mt-3'>
      <Row>
        <Col xs={0} md={1} />
        <Col align='center' xs={12} md={10}>
          <QuestionList />
        </Col>
        <Col xs={0} md={1} />
      </Row>
    </Container>
  </StrictMode>,
)
