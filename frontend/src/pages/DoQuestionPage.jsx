import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// Importing custom components
import QuestifyNavBar from '../components/QuestifyNavBar.jsx';
import DoQuestion from '../components/DoQuestion.jsx';
import CommentForm from '../components/CommentForm.jsx';
import CommentList from '../components/CommentList.jsx';
import QuestionRating from '../components/QuestionRating.jsx';

const DoQuestionPage = () => {
    // Get question ID from URL parameters using React Router
    const { questionId } = useParams();
    const id = parseInt(questionId) || 1;
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Callback to refresh comments when a new comment is posted
    const handleCommentPosted = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <QuestifyNavBar />
            <hr />
            <Container className="mt-3">
                <Row>
                    <Col xs={12} md={7}>
                        {/* DoQuestion component to display the question */}
                        <DoQuestion questionId={id} />

                        {/* Comment Form below DoQuestion */}
                        <div className="mt-4">
                            <CommentForm 
                                questionId={questionId} 
                                onCommentPosted={handleCommentPosted}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md={5}>
                        {/* Question Rating at the top */}
                        <QuestionRating questionId={questionId} />
                        
                        {/* Comment List below rating */}
                        <CommentList 
                            questionId={questionId} 
                            refreshTrigger={refreshTrigger}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default DoQuestionPage;
