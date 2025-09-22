import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="login-page">
      <Container fluid className="vh-100 p-0">
        <Row className="h-100 g-0 m-0">
          {/* Left Side - Introduction */}
          <Col lg={7} md={6} className="login-intro-section d-flex flex-column justify-content-center">
            <div className="intro-content">
              <div className="logo-container mb-4">
                <Link to="/">
                  <Logo />
                </Link>
              </div>

              <h1 className="intro-title">Welcome to OOSD Questify</h1>

              <div className="intro-description">
                <h4 className="intro-subtitle">A collaborative learning platform where students create, share, and evaluate OOSD questions together</h4>

                <div className="feature-list">
                  <div className="feature-item">
                    <h5>Create Questions</h5>
                    <p>Design questions on OOSD topics. Writing explanations helps you understand concepts better.</p>
                  </div>

                  <div className="feature-item">
                    <h5>Answer & Discuss</h5>
                    <p>Try questions from classmates, compare answers, and join discussions about different approaches.</p>
                  </div>

                  <div className="feature-item">
                    <h5>Learn Together</h5>
                    <p>Rate questions, track your progress, and build your understanding through peer collaboration.</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col lg={5} md={6} className="login-form-section d-flex align-items-center justify-content-center">
            <div className="form-wrapper">
              <div className="text-center mb-4">
                <h3 className="form-title">Sign in to continue</h3>
                <p className="form-subtitle text-muted">Start contributing and learning with your peers</p>
              </div>
              <LoginForm />
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .login-page {
          height: 100vh;
          background: #1f2937;
          overflow: hidden;
        }

        .login-intro-section {
          background: #1f2937;
          color: white;
          padding: 3rem 2rem;
        }

        .intro-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .logo-container {
          margin-bottom: 2rem;
        }

        .intro-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          line-height: 1.1;
          color: #f9fafb;
        }

        .intro-subtitle {
          font-size: 1.1rem;
          font-weight: 400;
          margin-bottom: 2.5rem;
          opacity: 0.8;
          line-height: 1.5;
          color: #d1d5db;
        }

        .feature-list {
          margin-top: 2rem;
        }

        .feature-item {
          margin-bottom: 1.5rem;
          padding: 0;
          border-left: 3px solid #6b7280;
          padding-left: 1rem;
        }

        .feature-item h5 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }

        .feature-item p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
          line-height: 1.4;
        }

        .login-form-section {
          background: #ffffff;
          padding: 3rem 2rem;
          border-left: 1px solid #e5e7eb;
        }

        .form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .login-intro-section {
            padding: 2rem 1.5rem;
          }

          .intro-title {
            font-size: 2rem;
          }

          .intro-subtitle {
            font-size: 1.1rem;
          }

          .feature-item {
            padding: 0.75rem;
          }

          .login-form-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
