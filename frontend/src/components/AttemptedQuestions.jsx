import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Pagination, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AttemptService } from '../services/attemptService';

/**
 * Attempted Questions Component
 * Displays a paginated list of questions the user has attempted
 * Uses real data from backend API: GET /api/attempts/user/
 */
const AttemptedQuestions = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // Show 12 questions (3 columns × 4 rows)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                setLoading(true);
                setError('');
                
                const data = await AttemptService.getUserAttempts();
                setAttempts(data);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching attempts:', err);
                setError('Failed to load attempted questions');
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    // Calculate pagination
    const totalPages = Math.ceil(attempts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAttempts = attempts.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle question click
    const handleQuestionClick = (questionId) => {
        navigate(`/question/${questionId}`);
    };

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let number = 1; number <= totalPages; number++) {
                items.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => handlePageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
        } else {
            // First page
            items.push(
                <Pagination.Item
                    key={1}
                    active={1 === currentPage}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Pagination.Item>
            );

            // Ellipsis if needed
            if (currentPage > 3) {
                items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            }

            // Pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let number = start; number <= end; number++) {
                items.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => handlePageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }

            // Ellipsis if needed
            if (currentPage < totalPages - 2) {
                items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            }

            // Last page
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={totalPages === currentPage}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Loading your attempted questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </Alert>
        );
    }

    if (attempts.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2" style={{ fontSize: '24px' }}></i>
                <div className="mt-2">
                    <strong>No Attempts Yet</strong>
                    <p className="mb-0 mt-2">
                        You haven't attempted any questions yet. Start practicing to see your history here!
                    </p>
                </div>
            </Alert>
        );
    }

    return (
        <div>
            {/* Questions Grid */}
            <div className="row g-3 mb-4">
                {currentAttempts.map((attempt) => (
                    <div key={attempt.id} className="col-12 col-md-6 col-lg-4">
                        <div
                            className={`card h-100 ${
                                attempt.is_correct === null 
                                    ? 'border-secondary' 
                                    : attempt.is_correct 
                                    ? 'border-success' 
                                    : 'border-danger'
                            } cursor-pointer`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleQuestionClick(attempt.question)}
                        >
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title mb-0" style={{ fontSize: '0.9rem' }}>
                                        {attempt.question_text || 'Question'}
                                    </h6>
                                </div>
                                <div className="d-flex gap-2 flex-wrap mb-2">
                                    {attempt.is_correct === null ? (
                                        <Badge bg="secondary" className="small">
                                            Short Answer
                                        </Badge>
                                    ) : attempt.is_correct ? (
                                        <Badge bg="success" className="small">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Correct
                                        </Badge>
                                    ) : (
                                        <Badge bg="danger" className="small">
                                            <i className="bi bi-x-circle me-1"></i>
                                            Incorrect
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <small className="text-muted">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatDate(attempt.submitted_at)}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mb-3">
                    <Pagination>
                        <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        {getPaginationItems()}
                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}

            {/* Page info */}
            <div className="text-center text-muted small">
                Showing {startIndex + 1} - {Math.min(endIndex, attempts.length)} of {attempts.length} attempted questions
            </div>
        </div>
    );
};

export default AttemptedQuestions;
