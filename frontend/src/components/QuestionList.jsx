import React, { useState, useEffect } from 'react';

// Importing the React-Bootstrap components
import { ListGroup, Alert, Spinner, Pagination } from 'react-bootstrap';

// Importing custom components
import QuestionListItem from './QuestionListItem.jsx';
import QuestionListSortingOption from './QuestionListSortingOption.jsx';
import QuestionListFilterOption from './QuestionListFilterOption.jsx';
import QuestionListSearch from './QuestionListSearch.jsx';

// Importing API service
import { QuestionService } from '../services/QuestionService.js';

// Example content data (fallback when API fails)
const EXAMPLE_QUESTION = [
    {
        id: 1,
        title: 'Java Variables and Data Types',
        week: 'Week 2',
        topic: 'Java Basics',
        attempted: true,
        verified: true,
        type: 'Multiple Choice',
        rating: 4.5,
        numAttempts: 12,
    },
    {
        id: 2,
        title: 'Object-Oriented Design Principles',
        week: 'Week 4',
        topic: 'OOP Concepts',
        attempted: false,
        verified: true,
        type: 'Multiple Choice',
        rating: 4.2,
        numAttempts: 8,
    },
    {
        id: 3,
        title: 'Java Class Constructors',
        week: 'Week 5',
        topic: 'Classes and Objects',
        attempted: true,
        verified: false,
        type: 'Short Answer',
        rating: 3.8,
        numAttempts: 15,
    },
    {
        id: 4,
        title: 'Inheritance and Polymorphism',
        week: 'Week 7',
        topic: 'Advanced OOP',
        attempted: true,
        verified: true,
        type: 'Long Answer',
        rating: 4.7,
        numAttempts: 6,
    },
    {
        id: 5,
        title: 'Exception Handling in Java',
        week: 'Week 8',
        topic: 'Error Management',
        attempted: false,
        verified: true,
        type: 'Multiple Choice',
        rating: 4.1,
        numAttempts: 10,
    },
    {
        id: 6,
        title: 'Array and ArrayList Operations',
        week: 'Week 3',
        topic: 'Data Structures',
        attempted: true,
        verified: true,
        type: 'Coding Exercise',
        rating: 3.9,
        numAttempts: 18,
    },
];

const QuestionList = ({
    title = 'Question List',
    useApi = true // Control whether to use API or fallback data
}) => {
    // State for questions data
    const [questions, setQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Fetch questions from API on component mount
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!useApi) {
                setQuestions(EXAMPLE_QUESTION);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const data = await QuestionService.getAllQuestions();
                setQuestions(data);
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to load questions, Displaying example data.');
                // Use fallback data when API fails
                setQuestions(EXAMPLE_QUESTION);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [useApi]);

    // Local filtering function (client-side filtering)
    const filteredContent = questions.filter(
        (item) =>
            item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.week
                ?.toLowerCase()
                .replace(/\s+/g, '')
                .includes(searchQuery.toLowerCase().replace(/\s+/g, '')) ||
            item.topic
                ?.toLowerCase()
                .replace(/\s+/g, '')
                .includes(searchQuery.toLowerCase().replace(/\s+/g, '')) ||
            item.type
                ?.toLowerCase()
                .replace(/\s+/g, '')
                .includes(searchQuery.toLowerCase().replace(/\s+/g, ''))
    );

    // Handle search from child component (local filtering only)
    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Calculate pagination values
    const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredContent.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
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
            // Show first page
            items.push(
                <Pagination.Item
                    key={1}
                    active={1 === currentPage}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Pagination.Item>
            );

            // Show ellipsis if needed
            if (currentPage > 3) {
                items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            }

            // Show pages around current page
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

            // Show ellipsis if needed
            if (currentPage < totalPages - 2) {
                items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            }

            // Show last page
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

    return (
        <div>
            <h1 className="">{title}</h1>
            <div className="border rounded-4 p-2 bg-body-tertiary">
                <div className="d-flex justify-content-between m-1">
                    <div>
                        <QuestionListFilterOption />
                        <QuestionListSortingOption />
                    </div>
                    <div className="align-self-center">
                        <QuestionListSearch onSearch={handleSearch} />
                    </div>
                </div>

                <hr />

                {/* Error display */}
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="text-center mb-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}

                {/* Questions list */}
                <ListGroup variant="flush" className="bg-body-secondary">
                    {currentItems.map((item) => (
                        <QuestionListItem
                            key={item.id}
                            id={item.id}
                            title={item.question}
                            week={item.week}
                            topic={item.topic}
                            attempted={item.attempted}
                            verified={item.verified}
                            questionType={item.type}
                            rating={item.rating}
                            numAttempts={item.num_attempts}
                        />
                    ))}
                </ListGroup>

                {/* No results message */}
                {!loading && filteredContent.length === 0 && (
                    <Alert variant="info" className="text-center">
                        {searchQuery ? 'No questions found matching your search.' : 'No questions available.'}
                    </Alert>
                )}

                {/* Pagination */}
                {!loading && filteredContent.length > 0 && totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4 mb-3">
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
                {!loading && filteredContent.length > 0 && (
                    <div className="text-center text-muted small mb-2">
                        Showing {startIndex + 1} - {Math.min(endIndex, filteredContent.length)} of {filteredContent.length} questions
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionList;
