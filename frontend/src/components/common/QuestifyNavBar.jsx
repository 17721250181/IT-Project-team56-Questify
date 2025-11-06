import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/QuestifyNavBar.css';

const QuestifyNavBar = () => {
    const navigate = useNavigate();
    const { logout, isAdmin, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            // Clear any saved redirect state and go to login
            navigate('/login', { replace: true, state: null });
        }
    };

    return (
        <Navbar expand="lg" className="questify-navbar">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    <Logo />
                    <h4 className="d-inline">OOSD Questify</h4>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAdmin && (
                            <NavLink to="/admin" className="nav-link">
                                Admin
                            </NavLink>
                        )}
                        <NavLink to="/" end className="nav-link">
                            Home
                        </NavLink>
                        <NavLink to="/questions" className="nav-link">
                            Questions
                        </NavLink>
                        <NavLink to="/post-question" className="nav-link">
                            Post Question
                        </NavLink>
                        <NavLink to="/leaderboard" className="nav-link">
                            Leaderboard
                        </NavLink>
                    </Nav>
                    <Nav className="ms-auto">
                        <NavDropdown
                            title={
                                <span className="d-flex align-items-center">
                                    <UserAvatar
                                        avatarUrl={user?.profile_picture_url}
                                        size="small"
                                        hoverable={false}
                                    />
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
    );
};

export default QuestifyNavBar;
