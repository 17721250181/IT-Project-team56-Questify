import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const PrivacyModal = ({ show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Privacy Policy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="p-3">
                    <h5>Questify Privacy Policy</h5>
                    <p className="text-muted">
                        <em>This is a placeholder for the Privacy Policy.</em>
                    </p>
                    
                    <hr />
                    
                    <h6>1. Information We Collect</h6>
                    <p>
                        We collect information that you provide directly to us, including:
                    </p>
                    <ul>
                        <li>Display name and student ID</li>
                        <li>University of Melbourne email address</li>
                        <li>Questions and answers you submit</li>
                        <li>Comments and ratings on questions</li>
                        <li>Usage data and activity history</li>
                    </ul>
                    
                    <h6>2. How We Use Your Information</h6>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process your account registration and authentication</li>
                        <li>Display your contributions (questions, answers, comments)</li>
                        <li>Generate activity statistics and leaderboards</li>
                        <li>Send you technical notices and support messages</li>
                    </ul>
                    
                    <h6>3. Information Sharing</h6>
                    <p>
                        Your display name and student ID may be visible to other users when you:
                    </p>
                    <ul>
                        <li>Submit questions or answers</li>
                        <li>Post comments</li>
                        <li>Appear on leaderboards</li>
                    </ul>
                    <p>
                        We do not sell or share your personal information with third parties for 
                        marketing purposes.
                    </p>
                    
                    <h6>4. Data Security</h6>
                    <p>
                        We implement appropriate technical and organizational measures to protect 
                        your personal information against unauthorized access, alteration, disclosure, 
                        or destruction.
                    </p>
                    
                    <h6>5. Data Retention</h6>
                    <p>
                        We retain your personal information for as long as your account is active or 
                        as needed to provide you services. You may request deletion of your account 
                        at any time.
                    </p>
                    
                    <h6>6. Your Rights</h6>
                    <p>
                        You have the right to:
                    </p>
                    <ul>
                        <li>Access and update your personal information</li>
                        <li>Request deletion of your account and data</li>
                        <li>Opt-out of certain data collection activities</li>
                        <li>Request a copy of your data</li>
                    </ul>
                    
                    <h6>7. Cookies and Tracking</h6>
                    <p>
                        We use cookies and similar tracking technologies to maintain your session 
                        and improve your experience on our platform.
                    </p>
                    
                    <h6>8. Changes to Privacy Policy</h6>
                    <p>
                        We may update this privacy policy from time to time. We will notify you of 
                        any changes by posting the new privacy policy on this page.
                    </p>
                    
                    <h6>9. Contact Us</h6>
                    <p>
                        If you have any questions about this privacy policy, please contact us through 
                        the platform's support channels.
                    </p>
                    
                    <div className="alert alert-info mt-4">
                        <strong>Note:</strong> This is a placeholder document. Full privacy policy 
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

export default PrivacyModal;
