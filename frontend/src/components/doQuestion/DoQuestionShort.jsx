import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Short Answer Question Component
 * Handles Short Answer Question rendering and interaction
 */
const DoQuestionShort = ({ 
    question, 
    userAnswer, 
    onAnswerChange, 
    submitted 
}) => {
    if (!submitted) {
        // Before submission - show input textarea
        return (
            <>
                <p className="text-secondary m-1">Please enter answer:</p>
                <Form className='m-1'>
                    <Form.Group className="m-1">
                        <Form.Label>Your Answer:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            disabled={submitted}
                            placeholder="Please enter your answer here..."
                        />
                    </Form.Group>
                </Form>
            </>
        );
    }

    // After submission - show all answers
    return (
        <div className="m-1">
            <p><strong>Your Answer:</strong></p>
            <Form.Control
                as="textarea"
                rows={3}
                value={userAnswer}
                readOnly
                className="mb-3"
            />

            <p><strong>Answer:</strong></p>
            <Form.Control
                as="textarea"
                rows={3}
                value={question?.answer || "No standard answer provided."}
                readOnly
                className="mb-3"
            />

            <p><strong>AI Answer:</strong></p>
            <Form.Control
                as="textarea"
                rows={3}
                value={question?.aiAnswer || "No AI answer available."}
                readOnly
            />
        </div>
    );
};

export default DoQuestionShort;
