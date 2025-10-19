import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap'
import Logo from './Logo'
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/QuestifyNavBar.css';

const QuestifyNavBar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Clear any saved redirect state and go to login
      navigate('/login', { replace: true, state: null });
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary p-3">
      <Container fluid>
        <Navbar.Brand as={Link} to='/'>
          <Logo />
          <h4 className="d-inline">OOSD Questify</h4>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/questions">Questions</Nav.Link>
            <Nav.Link as={Link} to="/post-question">Post Question</Nav.Link>
            <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <NavDropdown
              title={
                <span>
                  <i className="bi bi-person-circle user-avatar-icon"></i>
                  {user?.display_name && (
                    <span className="ms-2 user-display-name d-none d-md-inline">
                      {user.display_name}
                    </span>
                  )}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/user-profile">
                <i className="bi bi-person me-2"></i>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default QuestifyNavBar;