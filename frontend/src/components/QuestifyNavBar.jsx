import React from 'react'
import { Link } from 'react-router-dom'

// Importing the React-Bootstrap components
import NavBar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

// Importing custom components
import Logo from './Logo'

const QuestifyNavBar = () => {
return (
    <NavBar className='bg-body-tertiary'>
        <Container fluid>
            <NavBar.Brand as={Link} to='/'>
                <Logo />
                <h4 className="d-inline">OOSD Questify</h4>
            </NavBar.Brand>
        </Container>
    </NavBar>
)
}

export default QuestifyNavBar;
