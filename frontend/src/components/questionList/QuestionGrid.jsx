import React from 'react';
import QuestionDisplay from './QuestionDisplay';

/**
 * Question Grid Component
 * Displays questions in grid/card layout with pagination
 *
 * @param {string} type - 'attempted' or 'posted'
 * @param {number|null} ownerId - User ID to filter questions by (optional)
 * @param {boolean} isOwnProfile - Whether the grid is for the authenticated user
 */
const QuestionGrid = ({ type = 'attempted', ownerId = null, isOwnProfile = false }) => {
    return (
        <QuestionDisplay
            mode="grid"
            type={type}
            usePagination={true}
            ownerId={ownerId}
            isOwnProfile={isOwnProfile}
        />
    );
};

export default QuestionGrid;
