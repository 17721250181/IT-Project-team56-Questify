import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Importing the React-Bootstrap components
import NavBar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

// Importing custom components
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
        <NavBar className='bg-body-tertiary'>
            <Container fluid>
                <NavBar.Brand as={Link} to='/'>
                    <Logo />
                    <h4 className="d-inline">OOSD Questify</h4>
                </NavBar.Brand>

                <div className='ms-auto'>
                    <Button variant='outline-secondary' size='sm' onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </Container>
        </NavBar>
    )
}

export default QuestifyNavBar;
