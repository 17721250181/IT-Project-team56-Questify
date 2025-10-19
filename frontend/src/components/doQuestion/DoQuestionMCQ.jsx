import React from 'react';
import { Form, Badge } from 'react-bootstrap';

/**
 * MCQ Question Component
 * Handles Multiple Choice Question rendering and interaction
 */
const DoQuestionMCQ = ({ 
    question, 
    selectedAnswers, 
    onAnswerChange, 
    submitted 
}) => {
    // Render multiple choice options
    const renderOptions = () => {
        return (
            <Form className='m-1'>
                {question.options?.map((option, index) => (
                    <Form.Check
                        key={index}
                        type={question.multipleAnswers ? 'checkbox' : 'radio'}
                        id={`option-${index}`}
                        name="question-options"
                        label={option}
                        checked={selectedAnswers.includes(index)}
                        onChange={(e) => onAnswerChange(index, e.target.checked)}
                        disabled={submitted}
                        className="mb-2"
                    />
                ))}
            </Form>
        );
    };

    return (
        <>
            <p className="text-secondary m-1">Please select answer:</p>
            {renderOptions()}
            
            {/* Show correct answers after submission */}
            {submitted && (
                <div className="m-1 mt-4 pt-3 border-top">
                    <p className="mb-2"><strong>Correct Answer:</strong></p>
                    <div>
                        {question.correctOptions && question.correctOptions.length > 0
                            ? question.correctOptions
                                .sort()
                                .map(letter => {
                                    const index = letter.charCodeAt(0) - 65;
                                    return (
                                        <div key={letter} className="mb-1">
                                            <Badge bg="info" className="me-2">
                                                {letter}
                                            </Badge>
                                            <span>
                                                {question.options[index]}
                                            </span>
                                        </div>
                                    );
                                })
                            : <span className="text-muted">Not available</span>
                        }
                    </div>
                </div>
            )}
        </>
    );
};

export default DoQuestionMCQ;
