import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <>
      <div className='mt-3 ms-4'>
        <Link to="/">
          <Logo />
        </Link>
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
    </>
  );
};

export default LoginPage;
