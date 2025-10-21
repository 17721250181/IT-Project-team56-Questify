import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import { Logo } from '../components/common';
import { RegisterForm } from '../components/auth';
import '../styles/LoginPage.css'; // Reuse LoginPage styles
import '../styles/RegisterPage.css'; // Register-specific styles

const RegisterPage = () => {
  // Feature list data for registration context
  const features = [
    {
      title: "Create & Answer",
      description: "Write your own questions and try solving ones created by classmates. Great way to test your understanding."
    },
    {
      title: "Join Discussions",
      description: "Ask questions, share insights, and get help from classmates in the discussion section under each question."
    },
    {
      title: "Save & Compete",
      description: "Save questions you want to revisit later. See how you rank on weekly and semester leaderboards."
    },
    {
      title: "AI Assistance",
      description: "Stuck on something? Get hints and explanations that actually make sense, tailored to your level."
    }
  ];

  // Get current semester and year (same logic as LoginPage)
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const year = now.getFullYear();

    // Semester 1: February to June (months 2-6)
    // Semester 2: July to November (months 7-11)
    // December and January are considered break periods, default to S1 of current/next year
    if (month >= 2 && month <= 6) {
      return `S1 ${year}`;
    } else if (month >= 7 && month <= 11) {
      return `S2 ${year}`;
    } else {
      // December or January - default to S1 of current year
      return `S1 ${year}`;
    }
  };

  return (
    <div className="register-page">
      <Container fluid className="min-vh-100 p-0">
        <Row className="min-vh-100 g-0 m-0">
          {/* Left Side - Introduction */}
          <Col lg={7} md={6} className="register-intro-section d-flex flex-column">
            <div className="intro-header">
              <div className="brand-section">
                <Link to="/" className="brand-link">
                  <Logo />
                  <div className="brand-info">
                    <span className="brand-text">Questify</span>
                    <span className="university-name">The University of Melbourne</span>
                  </div>
                </Link>
                <div className="course-context">
                  <div className="course-header">
                    <span className="course-code">SWEN20003</span>
                    <span className="semester-badge">{getCurrentSemester()}</span>
                  </div>
                  <div className="course-title">Object-Oriented Software Development</div>
                </div>
              </div>
            </div>

            <div className="intro-content">
              <div className="main-content">
                <h1 className="intro-title">Join OOSD Questify Community</h1>
                <h4 className="intro-subtitle">Where SWEN20003 students help each other learn by creating and sharing practice questions</h4>

                <div className="feature-list">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <h5>{feature.title}</h5>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="stats-section">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <h3 className="stat-number">500+</h3>
                      <p className="stat-label">Questions Created</p>
                    </div>
                    <div className="stat-item">
                      <h3 className="stat-number">200+</h3>
                      <p className="stat-label">Active Students</p>
                    </div>
                    <div className="stat-item">
                      <h3 className="stat-number">15+</h3>
                      <p className="stat-label">Topics Covered</p>
                    </div>
                  </div>
                </div>

                {/* Registration Incentive */}
                <div className="incentive-section">
                  <div className="incentive-content">
                    <h5 className="incentive-title">🏆 Weekly Leaderboard</h5>
                    <p className="incentive-text">See who's contributing the most each week</p>
                    <p className="incentive-highlight">New semester, fresh start — climb the ranks!</p>
                  </div>
                </div>

              </div>
            </div>
          </Col>

          {/* Right Side - Register Form */}
          <Col lg={5} md={6} className="register-form-section d-flex align-items-start justify-content-center">
            <div className="register-form-wrapper">
              <div className="text-center mb-4">
                <h3 className="form-title">Create your account</h3>
                <p className="form-subtitle text-muted">Join your classmates in collaborative learning</p>
              </div>
              <RegisterForm />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;