import React from 'react';
import QuestionDisplay from './QuestionDisplay';

/**
 * Question Grid Component
 * Displays questions in grid/card layout with pagination
 * 
 * @param {string} type - 'attempted' or 'posted'
 */
const QuestionGrid = ({ type = 'attempted' }) => {
    return <QuestionDisplay mode="grid" type={type} usePagination={true} />;
};

export default QuestionGrid;
