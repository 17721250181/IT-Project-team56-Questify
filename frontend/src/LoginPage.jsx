import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Logo from './components/Logo';
import LoginForm from './components/LoginForm';

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className='mt-3 ms-4'>
      <Logo />
    </div>  
    <hr />
    <Container className='mt-3'>
      <Row>
        <Col xs={0} md={2} />
        <Col align='center' xs={12} md={8}>
          <h2>Welcome to OOSD Questify</h2>
          <LoginForm />
        </Col>
        <Col xs={0} md={2} />
      </Row>
    </Container>
  </StrictMode>,
)
