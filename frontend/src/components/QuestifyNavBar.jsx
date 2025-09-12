import React from 'react'

// Importing the React-Bootstrap components
import NavBar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

// Importing custom components
import Logo from './Logo'

const QuestifyNavBar = () => {
return (
    <NavBar className='bg-body-tertiary'>
        <Container fluid>
            <NavBar.Brand href='./index.html'>
                <Logo />
                OOSD Questify
            </NavBar.Brand>
        </Container>
    </NavBar>
)
}

export default QuestifyNavBar;
