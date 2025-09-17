import React from 'react';

// Importing the React-Bootstrap components
import {ListGroup} from 'react-bootstrap';

// Importing custom components
import QuestionListItem from './QuestionListItem.jsx';
import QuestionListSortingOption from './QuestionListSortingOption.jsx';
import QuestionListFilterOption from './QuestionListFilterOption.jsx';

// Example content data
const EXAMPLE_QUESTION = [
    {
        id: 1,
        title: "Question 1",
        week: "Week 1",
        attempted: true,
        questionType: "Multiple Choice",
        rating: 4.5,
        correctness: 0.8,
        numAttempts: 7
    },
    {
        id: 2,
        title: "Question 2",
        week: "Week 2",
        attempted: false,
        questionType: "True/False",
        rating: 3.0,
        correctness: 0.5,
        numAttempts: 5
    },
]

const QuestionList = ({
    title='Question List',
    content=EXAMPLE_QUESTION,
}) => {
  return (
    <div>
        <h1 className=''>{title}</h1>
        <div className='border rounded-4 p-2 bg-body-tertiary'>
            <div className='d-flex justify-content-between m-1'>
                <div>
                    <QuestionListSortingOption />
                    <QuestionListFilterOption />
                </div>
                <div>test</div>
                
            </div>
            
            <hr />
            <ListGroup variant='flush' className='bg-body-secondary'>
                {content.map((item) => (
                    <QuestionListItem 
                        key={item.id} 
                        title={item.title} 
                        week={item.week}
                        attempted={item.attempted}
                        questionType={item.questionType}
                        rating={item.rating}
                        correctness={item.correctness}
                        numAttempts={item.numAttempts}
                    />
                ))}
            </ListGroup>
        </div>
    </div>
  )
}

export default QuestionList;