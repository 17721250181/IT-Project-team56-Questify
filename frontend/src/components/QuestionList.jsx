import React, { useState, useEffect } from 'react';

// Importing the React-Bootstrap components
import { ListGroup, Alert, Spinner } from 'react-bootstrap';

// Importing custom components
import QuestionListItem from './QuestionListItem.jsx';
import QuestionListSortingOption from './QuestionListSortingOption.jsx';
import QuestionListFilterOption from './QuestionListFilterOption.jsx';
import QuestionListSearch from './QuestionListSearch.jsx';

// Importing API service
import { questionService } from '../services/questionService.js';

// Example content data (fallback when API fails)
const EXAMPLE_QUESTION = [
    {
        id: 1,
        title: 'Sample MCQ Question',
        week: 'Week 1',
        topic: 'Topic 1',
        attempted: true,
        verified: false,
        questionType: 'Multiple Choice',
        rating: 4.5,
        numAttempts: 7,
    },
    {
        id: 2,
        title: 'Sample True/False Question',
        week: 'Week 2',
        topic: 'Topic 2',
        attempted: false,
        verified: true,
        questionType: 'True/False',
        rating: 3.0,
        numAttempts: 5,
    },
    {
        id: 3,
        title: 'Sample Short Answer Question',
        week: 'Week 3',
        topic: 'Topic 3',
        attempted: true,
        verified: true,
        questionType: 'Short Answer',
        rating: 4.0,
        numAttempts: 3,
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
                const data = await questionService.getAllQuestions();
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
            item.title.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
            item.week.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
            item.topic?.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase()) ||
            item.questionType.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase())
    );

    // Handle search from child component (local filtering only)
    const handleSearch = (query) => {
        setSearchQuery(query);
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
                
                {/* No results message */}
                {!loading && filteredContent.length === 0 && (
                    <Alert variant="info" className="text-center">
                        {searchQuery ? 'No questions found matching your search.' : 'No questions available.'}
                    </Alert>
                )}
            </div>
        </div>
    );
};

export default QuestionList;
