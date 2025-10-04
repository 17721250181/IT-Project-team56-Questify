import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap'
import Logo from './Logo'
import { useAuth } from '../contexts/AuthContext';

const QuestifyNavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
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
            <NavDropdown title="More" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/leaderboard">Leaderboard</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default QuestifyNavBar;