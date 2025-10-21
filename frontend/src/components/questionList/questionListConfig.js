/**
 * Question List Configuration
 * Centralized settings and constants for question list functionality
 */

// ============================================================================
// SORTING CONFIGURATION
// ============================================================================

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'rating_desc', label: 'Highest rating' },
    { value: 'rating_asc', label: 'Lowest rating' },
    { value: 'attempts_desc', label: 'Most attempts' },
    { value: 'attempts_asc', label: 'Fewest attempts' },
    { value: 'author_asc', label: 'Author A → Z' },
    { value: 'author_desc', label: 'Author Z → A' },
];

export const SORT_DEFAULT = 'newest';

// ============================================================================
// FILTER CONFIGURATION
// ============================================================================

export const QUESTION_FILTER_DEFAULTS = {
    week: '',
    topic: '',
    type: '',
    source: '',
    verified: false,
    minRating: 0,
    maxRating: 0,
};

export const RATING_OPTIONS = [0, 1, 2, 3, 4, 5];

export const DEFAULT_WEEK_OPTIONS = [
    'Week1',
    'Week2',
    'Week3',
    'Week4',
    'Week5',
    'Week6',
    'Week7',
    'Week8',
    'Week9',
    'Week10',
    'Week11',
    'Week12'
];

export const DEFAULT_TOPIC_OPTIONS = [
    'JAVA basics',
    'Classes and Objects',
    'Software Tools and Bagel',
    'Arrays and Strings',
    'Input and Output',
    'Inheritance and Polymorphism',
    'Interfaces and Polymorphism',
    'Modelling Classes and Relationships',
    'Generics',
    'Collections and Maps',
    'Design Patterns',
    'Exceptions',
    'Software Testing and Design',
    'Event Driven Programming',
    'Advanced Java'
];

export const DEFAULT_TYPE_OPTIONS = ['MCQ', 'SHORT'];

export const DEFAULT_SOURCE_OPTIONS = ['STUDENT', 'TEACHING_TEAM'];

// ============================================================================
// PAGINATION CONFIGURATION
// ============================================================================

export const ITEMS_PER_PAGE_GRID = 12;
export const ITEMS_PER_PAGE_LIST = 20;
export const MAX_VISIBLE_PAGES = 5;

// ============================================================================
// DISPLAY MODE CONFIGURATION
// ============================================================================

export const DISPLAY_MODES = {
    GRID: 'grid',
    LIST: 'list'
};

export const DATA_TYPES = {
    ALL: 'all',
    ATTEMPTED: 'attempted',
    POSTED: 'posted'
};
