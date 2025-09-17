import React from 'react';

// Importing the React-Bootstrap components
import Stack from 'react-bootstrap/Stack';

// Importing custom components
import QuestionListItem from './QuestionListItem.jsx';

const QuestionList = () => {
  return (
    <div className='border rounded-4 p-2 bg-body-tertiary'>
        <h1>Question List</h1>
        <hr />
        <Stack gap={1}>
            <QuestionListItem title="Question 1" />
            <QuestionListItem title="Question 2" />
            <QuestionListItem title="Question 3" />
        </Stack>
    </div>
    
  )
}

export default QuestionList;