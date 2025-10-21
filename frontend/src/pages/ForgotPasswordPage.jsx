import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

// Importing custom components
import { Logo } from '../components/common';
import { ForgotPasswordForm } from '../components/auth';
import '../styles/LoginPage.css'; // Reuse LoginPage styles for header
import '../styles/ForgotPasswordPage.css'; // Specific styles

const ForgotPasswordPage = () => {
  // Get current semester and year (same logic as other pages)
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
    <div className="forgot-password-page">
      <Container fluid className="min-vh-100 p-0">
        {/* Header Section */}
        <div className="forgot-password-header">
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

        {/* Main Content - Centered Form */}
        <div className="forgot-password-main">
          <div className="forgot-password-container">
            <div className="text-center mb-4">
              <h2 className="forgot-password-title">Forgot your password?</h2>
              <p className="forgot-password-subtitle text-muted">
                Enter your email address and we'll send you a reset link
              </p>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;