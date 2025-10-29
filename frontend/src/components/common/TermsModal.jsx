import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TermsModal = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Terms and Conditions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="p-3">
                    <h5>Welcome to Questify</h5>
                    <p className="text-muted">
                        <em>This is a placeholder for the Terms and Conditions.</em>
                    </p>
                    
                    <hr />
                    
                    <h6>1. Acceptance of Terms</h6>
                    <p>
                        By accessing and using Questify, you accept and agree to be bound by the terms 
                        and provision of this agreement.
                    </p>
                    
                    <h6>2. Use License</h6>
                    <p>
                        Permission is granted to temporarily access the materials on Questify for personal, 
                        non-commercial transitory viewing only.
                    </p>
                    
                    <h6>3. User Account</h6>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. 
                        You must use a valid University of Melbourne student email address to register.
                    </p>
                    
                    <h6>4. User Content</h6>
                    <p>
                        Users may submit questions and answers. By submitting content, you grant Questify 
                        the right to use, modify, and display such content within the platform.
                    </p>
                    
                    <h6>5. Privacy</h6>
                    <p>
                        Your use of Questify is also governed by our Privacy Policy. Please review our 
                        Privacy Policy to understand our practices.
                    </p>
                    
                    <h6>6. Prohibited Activities</h6>
                    <p>
                        You agree not to engage in any of the following prohibited activities:
                    </p>
                    <ul>
                        <li>Copying or distributing content without permission</li>
                        <li>Using the platform for any illegal purposes</li>
                        <li>Attempting to gain unauthorized access to the system</li>
                        <li>Submitting false or misleading information</li>
                    </ul>
                    
                    <h6>7. Disclaimer</h6>
                    <p>
                        The materials on Questify are provided on an 'as is' basis. Questify makes no 
                        warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                    </p>
                    
                    <h6>8. Modifications</h6>
                    <p>
                        Questify may revise these terms of service at any time without notice. By using 
                        this platform, you are agreeing to be bound by the current version of these terms.
                    </p>
                    
                    <div className="alert alert-info mt-4">
                        <strong>Note:</strong> This is a placeholder document. Full terms and conditions 
                        will be provided upon official release.
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TermsModal;
