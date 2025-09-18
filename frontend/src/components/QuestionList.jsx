import React, { useState } from 'react';

// Importing the React-Bootstrap components
import {ListGroup} from 'react-bootstrap';

// Importing custom components
import QuestionListItem from './QuestionListItem.jsx';
import QuestionListSortingOption from './QuestionListSortingOption.jsx';
import QuestionListFilterOption from './QuestionListFilterOption.jsx';
import QuestionListSearch from './QuestionListSearch.jsx';

// Example content data
const EXAMPLE_QUESTION = [
    {
        id: 1,
        title: "Sample MCQ Question",
        week: "Week 1",
        topic: "Topic 1",
        attempted: true,
        verified: false,
        questionType: "Multiple Choice",
        rating: 4.5,
        numAttempts: 7
    },
    {
        id: 2,
        title: "Sample True/False Question",
        week: "Week 2",
        topic: "Topic 2",
        attempted: false,
        verified: true,
        questionType: "True/False",
        rating: 3.0,
        numAttempts: 5
    },
    {
        id: 3,
        title: "Sample Short Answer Question",
        week: "Week 3",
        topic: "Topic 3",
        attempted: true,
        verified: true,
        questionType: "Short Answer",
        rating: 4.0,
        numAttempts: 3
    }
]

const QuestionList = ({
    title='Question List',
    content=EXAMPLE_QUESTION,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter content based on search query
    const filteredContent = content.filter(item => 
        item.title.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
        item.week.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
        item.topic.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
        item.questionType.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase())
    );

    // Handle search from child component
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <div>
            <h1 className=''>{title}</h1>
            <div className='border rounded-4 p-2 bg-body-tertiary'>
                <div className='d-flex justify-content-between m-1'>
                    <div>
                        <QuestionListFilterOption />
                        <QuestionListSortingOption />
                    </div>
                    <div className='align-self-center'>
                        <QuestionListSearch onSearch={handleSearch} />
                    </div>
                    
                </div>
                
                <hr />
                <ListGroup variant='flush' className='bg-body-secondary'>
                    {filteredContent.map((item) => (
                        <QuestionListItem 
                            key={item.id} 
                            title={item.title} 
                            week={item.week}
                            topic={item.topic}
                            attempted={item.attempted}
                            verified={item.verified}
                            questionType={item.questionType}
                            rating={item.rating}
                            numAttempts={item.numAttempts}
                        />
                    ))}
                </ListGroup>
            </div>
        </div>
    )
}

export default QuestionList;