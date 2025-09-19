import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing custom components
import QuestifyNavBar from './components/QuestifyNavBar.jsx';
import DoQuestion from './components/DoQuestion.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QuestifyNavBar />
        <hr />
        <Container className="mt-3">
            <Row>
                <Col xs={0} md={2} />
                <Col align="center" xs={12} md={8}>
                    <DoQuestion questionId={1} />
                </Col>
                {/* <Col align="center" xs={12} md={2}>
                    <CommentSection />
                </Col> */}
                <Col xs={0} md={2} />
            </Row>
        </Container>
    </StrictMode>
);
