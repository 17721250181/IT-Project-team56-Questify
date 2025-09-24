import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import Logo from '../components/Logo';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
    // Feature list data
    const features = [
        {
            title: 'Create Questions',
            description:
                'Design questions on OOSD topics. Writing explanations helps you understand concepts better.',
        },
        {
            title: 'Answer & Discuss',
            description:
                'Try questions from classmates, compare answers, and join discussions about different approaches.',
        },
        {
            title: 'Learn Together',
            description:
                'Rate & save questions, track your progress, and build your understanding through peer collaboration.',
        },
        {
            title: 'AI Assistant',
            description:
                'Get instant help with built-in AI chatbot and receive AI-generated explanations alongside peer answers.',
        },
    ];

    // Get current semester and year
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
        <div className="login-page">
            <Container fluid className="vh-100 p-0">
                <Row className="h-100 g-0 m-0">
                    {/* Left Side - Introduction */}
                    <Col lg={7} md={6} className="login-intro-section d-flex flex-column">
                        <div className="intro-header">
                            <div className="brand-section">
                                <Link to="/" className="brand-link">
                                    <Logo />
                                    <div className="brand-info">
                                        <span className="brand-text">Questify</span>
                                        <span className="university-name">
                                            The University of Melbourne
                                        </span>
                                    </div>
                                </Link>
                                <div className="course-context">
                                    <div className="course-header">
                                        <span className="course-code">SWEN20003</span>
                                        <span className="semester-badge">
                                            {getCurrentSemester()}
                                        </span>
                                    </div>
                                    <div className="course-title">
                                        Object-Oriented Software Development
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="intro-content">
                            <div className="main-content">
                                <h1 className="intro-title">Welcome to OOSD Questify</h1>
                                <h4 className="intro-subtitle">
                                    A collaborative learning platform where students create, share,
                                    and evaluate OOSD questions together
                                </h4>

                                <div className="feature-list">
                                    {features.map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <h5>{feature.title}</h5>
                                            <p>{feature.description}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="quote-section">
                                    <blockquote className="intro-quote">
                                        "Tell me and I forget, teach me and I may remember, involve
                                        me and I learn."
                                    </blockquote>
                                    <cite className="quote-author">
                                        — Xunzi (ancient Chinese philosopher)
                                    </cite>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Right Side - Login Form */}
                    <Col
                        lg={5}
                        md={6}
                        className="login-form-section d-flex align-items-center justify-content-center"
                    >
                        <div className="form-wrapper">
                            <div className="text-center mb-4">
                                <h3 className="form-title">Sign in to continue</h3>
                                <p className="form-subtitle text-muted">
                                    Start contributing and learning with your peers
                                </p>
                            </div>
                            <LoginForm />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;
