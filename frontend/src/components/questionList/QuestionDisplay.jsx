import React, { useEffect, useState } from 'react';
import { Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AttemptService } from '../../services/attemptService';
import { QuestionService } from '../../services/QuestionService';
import QListItem from './QListItem';
import QGridCard from './QGridCard';
import QSortingOption from './QSortingOption';
import QFilterOption from './QFilterOption';
import {
    QUESTION_FILTER_DEFAULTS,
    SORT_DEFAULT,
    DEFAULT_WEEK_OPTIONS,
    DEFAULT_TOPIC_OPTIONS,
    DEFAULT_TYPE_OPTIONS,
    DEFAULT_SOURCE_OPTIONS,
    ITEMS_PER_PAGE_GRID,
    ITEMS_PER_PAGE_LIST
} from './questionListConfig';
import QListSearch from './QListSearch';
import QuestionPagination from './QuestionPagination';

const mergeWithDefaults = (defaults, extras = [], sortExtras) => {
    const seen = new Set();
    const merged = [];

    defaults.forEach((item) => {
        if (item && !seen.has(item)) {
            merged.push(item);
            seen.add(item);
        }
    });

    const filteredExtras = (extras || []).filter((item) => item && !seen.has(item));
    if (sortExtras) {
        filteredExtras.sort(sortExtras);
    }

    filteredExtras.forEach((item) => {
        merged.push(item);
        seen.add(item);
    });

    return merged;
};

const extractWeekNumber = (label = '') => {
    const match = label.match(/\d+/);
    return match ? parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
};

const mergeWeekOptions = (extras) =>
    mergeWithDefaults(DEFAULT_WEEK_OPTIONS, extras, (value) => [extractWeekNumber(value), value]);

const mergeTopicOptions = (extras) =>
    mergeWithDefaults(DEFAULT_TOPIC_OPTIONS, extras, (value) => value.toLowerCase());

const mergeSimpleOptions = (defaults, extras) =>
    mergeWithDefaults(defaults, extras, (value) => value.toLowerCase());

const hasActiveFilters = (filters) => {
    if (!filters) {
        return false;
    }

    return (
        Boolean(filters.week) ||
        Boolean(filters.topic) ||
        Boolean(filters.type) ||
        Boolean(filters.source) ||
        Boolean(filters.verified) ||
        (typeof filters.minRating === 'number' && filters.minRating > 0) ||
        (typeof filters.maxRating === 'number' && filters.maxRating > 0)
    );
};

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
    title = null,
    ownerId = null,
    isOwnProfile = false,
}) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ ...QUESTION_FILTER_DEFAULTS });
    const [sortOption, setSortOption] = useState(SORT_DEFAULT);
    const [filterOptions, setFilterOptions] = useState({
        weeks: DEFAULT_WEEK_OPTIONS,
        topics: DEFAULT_TOPIC_OPTIONS,
        types: DEFAULT_TYPE_OPTIONS,
        sources: DEFAULT_SOURCE_OPTIONS,
    });

    const itemsPerPage = mode === 'grid' ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;
    const shouldUsePagination = usePagination !== null ? usePagination : mode === 'grid';

    const navigate = useNavigate();

    const isAttempted = type === 'attempted';
    const isPosted = type === 'posted';
    const isAll = type === 'all';
    const hasSearchValue = searchQuery.trim().length > 0;
    const filtersApplied = isAll && hasActiveFilters(filters);

    // Reset search & paging when changing dataset type
    useEffect(() => {
        setSearchQuery('');
        setCurrentPage(1);
    }, [type]);

    // Reset filters when leaving the "all" dataset
    useEffect(() => {
        if (!isAll) {
            setFilters({ ...QUESTION_FILTER_DEFAULTS });
            setSortOption(SORT_DEFAULT);
        }
    }, [isAll]);

    // Load metadata (weeks/topics/types/sources) for filters
    useEffect(() => {
        if (!isAll) return;

        let active = true;
        const loadMetadata = async () => {
            try {
                const meta = await QuestionService.getQuestionMetadata();
                if (!active) return;
                setFilterOptions({
                    weeks: DEFAULT_WEEK_OPTIONS,
                    topics: DEFAULT_TOPIC_OPTIONS,
                    types: mergeSimpleOptions(DEFAULT_TYPE_OPTIONS, meta?.types),
                    sources: mergeSimpleOptions(DEFAULT_SOURCE_OPTIONS, meta?.sources),
                });
            } catch (err) {
                console.error('Failed to load question metadata:', err);
            }
        };

        loadMetadata();
        return () => {
            active = false;
        };
    }, [isAll]);

    // Fetch data for "all" questions with filters/sorting/search
    useEffect(() => {
        if (!isAll) return;

        let active = true;
        setLoading(true);
        setError('');

        const debounceId = setTimeout(async () => {
            try {
                const data = await QuestionService.getAllQuestions({
                    search: searchQuery,
                    filters,
                    sort: sortOption,
                });
                if (!active) return;
                setItems(data || []);
                setFilteredItems(data || []);
                setCurrentPage(1);
            } catch (err) {
                if (!active) return;
                console.error('Error fetching all questions:', err);
                setItems([]);
                setFilteredItems([]);
                setError('Failed to load all questions. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(debounceId);
        };
    }, [isAll, searchQuery, filters, sortOption]);

    // Fetch data for attempted or posted question views
    useEffect(() => {
        if (!isAttempted && !isPosted) return;

        let active = true;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                let data;
                if (isAttempted) {
                    if (ownerId && !isOwnProfile) {
                        data = [];
                    } else {
                        data = await AttemptService.getUserAttempts();
                    }
                } else if (isPosted) {
                    if (ownerId && !isOwnProfile) {
                        data = await QuestionService.getQuestionsByCreator(ownerId, {
                            sort: sortOption,
                        });
                    } else {
                        data = await QuestionService.getUserQuestions();
                    }
                }
                if (!active) return;
                setItems(data || []);
                setFilteredItems(data || []);
            } catch (err) {
                if (!active) return;
                console.error(`Error fetching ${type} questions:`, err);
                setItems([]);
                setFilteredItems([]);
                setError(`Failed to load ${type} questions. Please try again.`);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [isAttempted, isPosted, type, ownerId, sortOption, isOwnProfile]);

    // Client-side search for attempted/posted datasets
    useEffect(() => {
        if (isAll) {
            setFilteredItems(items);
            return;
        }

        if (!searchQuery) {
            setFilteredItems(items);
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
        const filtered = items.filter((item) => {
            const questionText = isAttempted ? item.question_text : item.question;
            return (
                questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.week?.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery) ||
                item.topic?.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery) ||
                item.type?.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery)
            );
        });

        setFilteredItems(filtered);
        setCurrentPage(1);
    }, [searchQuery, items, isAttempted, isAll]);

    const totalPages = Math.ceil((filteredItems.length || 0) / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = shouldUsePagination
        ? filteredItems.slice(startIndex, endIndex)
        : filteredItems;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleQuestionClick = (questionId) => {
        navigate(`/question/${questionId}`);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleFilterApply = (newFilters) => {
        setFilters({
            ...QUESTION_FILTER_DEFAULTS,
            ...newFilters,
        });
        setCurrentPage(1);
    };

    const handleFilterClear = () => {
        setFilters({ ...QUESTION_FILTER_DEFAULTS });
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setSortOption(value || SORT_DEFAULT);
        setCurrentPage(1);
    };

    const getBorderClass = (item) => {
        if (isAttempted) {
            if (item.is_correct === null) return 'border-secondary';
            return item.is_correct ? 'border-success' : 'border-danger';
        }
        return 'border-secondary';
    };

    const renderQuestions = (displayMode) => {
        const isGridMode = displayMode === 'grid';

        const questionItems = currentItems.map((item) => {
            const questionId = isAttempted ? item.question : item.id;
            const questionText = isAttempted ? item.question_text : item.question;
            const numAttempts = item.numAttempts ?? item.num_attempts ?? 0;
            const rating = item.rating ?? 0;
            const verifyStatus = item.verify_status ?? item.verifyStatus;

            return isGridMode ? (
                <QGridCard
                    key={questionId}
                    id={questionId}
                    title={questionText}
                    type={item.type}
                    week={item.week}
                    topic={item.topic}
                    verifyStatus={verifyStatus}
                    isCorrect={item.is_correct}
                    date={isAttempted ? item.submitted_at : item.created_at}
                    numAttempts={numAttempts}
                    displayMode={type}
                    onClick={handleQuestionClick}
                    borderClass={getBorderClass(item)}
                />
            ) : (
                <QListItem
                    key={questionId}
                    id={questionId}
                    title={questionText}
                    week={item.week}
                    topic={item.topic}
                    attempted={isAttempted ? true : item.attempted}
                    verified={verifyStatus === 'APPROVED' || item.verified}
                    questionType={item.type}
                    rating={Number(rating).toFixed(1)}
                    numAttempts={numAttempts}
                />
            );
        });

        const paginationComponent = shouldUsePagination && (
            <QuestionPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        );

        const pageInfo =
            shouldUsePagination && filteredItems.length > 0 && (
                <div className="text-center text-muted small">
                    Showing {startIndex + 1} - {Math.min(endIndex, filteredItems.length)} of {filteredItems.length}{' '}
                    questions
                </div>
            );

        const noResultsMessage = hasSearchValue
            ? 'No questions found matching your search.'
            : filtersApplied
                ? 'No questions match the selected filters yet.'
                : 'No questions available.';

        if (isGridMode) {
            return (
                <div>
                    <div className="row g-3 mb-4">{questionItems}</div>
                    {currentItems.length === 0 && !loading && (
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-info-circle me-2"></i>
                            {noResultsMessage}
                        </Alert>
                    )}
                    {paginationComponent}
                    {pageInfo}
                </div>
            );
        }

        return (
            <div>
                <ListGroup variant="flush" className="bg-body-secondary">
                    {questionItems}
                </ListGroup>

                {currentItems.length === 0 && !loading && (
                    <Alert variant="info" className="text-center mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        {noResultsMessage}
                    </Alert>
                )}

                {shouldUsePagination && <div className="mt-3">{paginationComponent}</div>}

                {pageInfo}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Loading {type === 'all' ? 'all' : type} questions...</p>
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

    const baseDatasetEmpty = items.length === 0;
    const shouldShowGlobalEmptyState =
        baseDatasetEmpty &&
        !loading &&
        !error &&
        (
            !isAll ||
            (isAll && !filtersApplied && !hasSearchValue)
        );

    if (shouldShowGlobalEmptyState) {
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

    return (
        <div>
            {title && <h1>{title}</h1>}

            {showSearch && mode === 'list' && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 m-1">
                    <div className="d-flex flex-wrap gap-2">
                        {isAll && (
                            <>
                                <QFilterOption
                                    filters={filters}
                                    onApply={handleFilterApply}
                                    onClear={handleFilterClear}
                                    options={filterOptions}
                                />
                                <QSortingOption sortOption={sortOption} onChange={handleSortChange} />
                            </>
                        )}
                    </div>
                    <div className="align-self-start align-self-md-center">
                        <QListSearch onSearch={handleSearch} />
                    </div>
                </div>
            )}

            {showSearch && mode === 'grid' && (
                <div className="mb-3">
                    <QListSearch onSearch={handleSearch} />
                </div>
            )}

            {renderQuestions(mode)}
        </div>
    );
};

export default QuestionDisplay;
