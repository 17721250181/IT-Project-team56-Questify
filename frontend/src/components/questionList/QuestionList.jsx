import React from 'react';
import QuestionDisplay from './QuestionDisplay';

/**
 * Question List Component
 * Displays questions in list/table layout with search/filter/sort controls
 * 
 * @param {string} title - Title to display above the list
 */
const QuestionList = ({ title = 'Question List' }) => {
    return <QuestionDisplay mode="list" type="all" showSearch={true} usePagination={true} title={title} />;
};

export default QuestionList;
