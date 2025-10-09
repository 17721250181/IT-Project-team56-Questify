import React, { useState, useEffect } from 'react';
import { Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AttemptService } from '../../services/attemptService';
import { QuestionService } from '../../services/QuestionService';
import QListItem from './QListItem';
import QGridCard from './QGridCard';
import QSortingOption from './QSortingOption';
import QFilterOption from './QFilterOption';
import QListSearch from './QListSearch';
import QuestionPagination from './QuestionPagination';

/**
 * Question Display Component
 * Core component for displaying questions in different modes
 * 
 * @param {string} mode - Display mode: 'list' or 'grid' (default: 'grid')
 * @param {string} type - Data type: 'all', 'attempted', or 'posted' (default: 'all')
 * @param {boolean} showSearch - Show search/filter/sort controls (default: false)
 * @param {boolean} usePagination - Use pagination (default: true for grid, false for list)
 * @param {string} title - Optional title for the component
 */
const QuestionDisplay = ({ 
    mode = 'grid',
    type = 'all',
    showSearch = false,
    usePagination = null,
    title = null
}) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = mode === 'grid' ? 12 : 10;
    const navigate = useNavigate();

    // Determine if pagination should be used
    const shouldUsePagination = usePagination !== null ? usePagination : mode === 'grid';

    const isAttempted = type === 'attempted';
    const isPosted = type === 'posted';
    const isAll = type === 'all';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                let data;
                if (isAttempted) {
                    data = await AttemptService.getUserAttempts();
                } else if (isPosted) {
                    data = await QuestionService.getUserQuestions();
                } else if (isAll) {
                    data = await QuestionService.getAllQuestions();
                }
                
                setItems(data || []);
                setFilteredItems(data || []);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching ${type} questions:`, err);
                setError(`Failed to load ${type} questions`);
                setLoading(false);
            }
        };

        fetchData();
    }, [type, isAttempted, isPosted, isAll]);

    // Apply search filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredItems(items);
            return;
        }

        const query = searchQuery.toLowerCase().replace(/\s+/g, '');
        const filtered = items.filter((item) => {
            const questionText = isAttempted ? item.question_text : item.question;
            return (
                questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.week?.toLowerCase().replace(/\s+/g, '').includes(query) ||
                item.topic?.toLowerCase().replace(/\s+/g, '').includes(query) ||
                item.type?.toLowerCase().replace(/\s+/g, '').includes(query)
            );
        });
        
        setFilteredItems(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchQuery, items, isAttempted]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = shouldUsePagination 
        ? filteredItems.slice(startIndex, endIndex) 
        : filteredItems;

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle question click
    const handleQuestionClick = (questionId) => {
        navigate(`/question/${questionId}`);
    };

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Helper function for grid card border class
    const getBorderClass = (item) => {
        if (isAttempted) {
            if (item.is_correct === null) return 'border-secondary';
            return item.is_correct ? 'border-success' : 'border-danger';
        }
        return 'border-secondary';
    };

    // Render questions in specified mode
    const renderQuestions = (displayMode) => {
        const isGridMode = displayMode === 'grid';
        
        // Generate question items
        const questionItems = currentItems.map((item) => {
            const questionId = isAttempted ? item.question : item.id;
            const questionText = isAttempted ? item.question_text : item.question;
            
            return isGridMode ? (
                <QGridCard
                    key={item.id}
                    id={questionId}
                    title={questionText}
                    type={item.type}
                    week={item.week}
                    topic={item.topic}
                    verifyStatus={item.verify_status}
                    isCorrect={item.is_correct}
                    date={isAttempted ? item.submitted_at : item.created_at}
                    numAttempts={item.num_attempts}
                    displayMode={type}
                    onClick={handleQuestionClick}
                    borderClass={getBorderClass(item)}
                />
            ) : (
                <QListItem
                    key={item.id}
                    id={questionId}
                    title={questionText}
                    week={item.week}
                    topic={item.topic}
                    attempted={isAttempted ? true : item.attempted}
                    verified={item.verify_status === 'APPROVED' || item.verified}
                    questionType={item.type}
                    rating={item.rating}
                    numAttempts={item.num_attempts}
                />
            );
        });

        // Generate pagination component
        const paginationComponent = shouldUsePagination && (
            <QuestionPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        );

        // Generate page info
        const pageInfo = shouldUsePagination && filteredItems.length > 0 && (
            <div className="text-center text-muted small">
                Showing {startIndex + 1} - {Math.min(endIndex, filteredItems.length)} of{' '}
                {filteredItems.length} questions
            </div>
        );

        // Return appropriate layout
        if (isGridMode) {
            return (
                <div>
                    {/* Questions Grid */}
                    <div className="row g-3 mb-4">
                        {questionItems}
                    </div>
                    {paginationComponent}
                    {pageInfo}
                </div>
            );
        } else {
            return (
                <div>
                    {/* Questions List */}
                    <ListGroup variant="flush" className="bg-body-secondary">
                        {questionItems}
                    </ListGroup>

                    {/* No results message */}
                    {currentItems.length === 0 && !loading && (
                        <Alert variant="info" className="text-center mt-3">
                            {searchQuery
                                ? 'No questions found matching your search.'
                                : 'No questions available.'}
                        </Alert>
                    )}

                    {/* Pagination */}
                    {shouldUsePagination && (
                        <div className="mt-3">
                            {paginationComponent}
                        </div>
                    )}

                    {pageInfo}
                </div>
            );
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">
                    Loading {type === 'all' ? 'all' : type} questions...
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </Alert>
        );
    }

    // Empty state
    if (items.length === 0) {
        return (
            <Alert variant="info" className="text-center">
                <div>
                    <i className="bi bi-info-circle me-2" style={{ fontSize: '18px' }}></i>
                    <strong>
                        {isAttempted
                            ? 'No Attempts Yet'
                            : isPosted
                            ? 'No Questions Posted Yet'
                            : 'No Questions Available'}
                    </strong>
                    <p className="mb-0 mt-2">
                        {isAttempted
                            ? "You haven't attempted any questions yet. Start practicing to see your history here!"
                            : isPosted
                            ? "You haven't created any questions yet. Start contributing by uploading questions!"
                            : 'No questions are currently available.'}
                    </p>
                </div>
            </Alert>
        );
    }

    // Main render with search/filter controls
    return (
        <div>
            {title && <h1>{title}</h1>}

            {showSearch && mode === 'list' && (
                <div className="d-flex justify-content-between m-1">
                    <div>
                        <QFilterOption />
                        <QSortingOption />
                    </div>
                    <div className="align-self-center">
                        <QListSearch onSearch={handleSearch} />
                    </div>
                </div>
            )}

            {showSearch && mode === 'grid' && (
                <div>
                    <QListSearch onSearch={handleSearch} />
                </div>
            )}

            {renderQuestions(mode)}
        </div>
    );
};

export default QuestionDisplay;
