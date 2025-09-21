import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, ListGroupItem, Row, Col } from 'react-bootstrap'

const QuestionListItem = ({ 
    id,
    title='Question Title',
    week='Week 0', 
    topic='Topic 0',
    attempted=false, 
    verified=false,
    questionType='undefined type',
    rating = 0.0,
    numAttempts = 0
}) => {
  const navigate = useNavigate();
  
  // Handle click to navigate to DoQuestion page
  const handleQuestionClick = () => {
    // Navigate to DoQuestion page with question ID as URL parameter
    navigate(`/question/${id}`);
  };

  return (
    <ListGroupItem 
      className='p-1 border-bottom' 
      style={{ cursor: 'pointer' }}
      onClick={handleQuestionClick}
    >
      <Row className="align-items-start">
        {/* Title Area */}
        <Col xs={12} md={6} lg={3} className="text-start">
          <h6 className='mb-1 mb-md-0'>
              <span style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'left'
              }}>
                  {title}
              </span>
          </h6>
        </Col>

        {/* Rating information Area */}
        <Col xs={12} md={6} lg={3} className="text-start text-md-end order-lg-3">
          <div>
            <Badge className='m-1' bg='info'>Rating: {rating}</Badge>
            <Badge className='m-1' bg='info'>User Attempts: {numAttempts}</Badge>
          </div>
        </Col>
        
        {/* Question Tags Area */}
        <Col xs={12} md={12} lg={6} className="text-start">
          <div>
            <Badge className='m-1' bg='secondary'>{week}</Badge>
            <Badge className='m-1' bg='secondary'>{topic}</Badge>
            <Badge className='m-1' bg='secondary'>{questionType}</Badge>
            {verified ? <Badge className='m-1' bg='secondary'>Verified✅</Badge> : <Badge className='m-1' bg='secondary'>Not Verified</Badge>}
            {attempted ? <Badge className='m-1' bg='secondary'>Attempted</Badge> : null}
          </div>
        </Col>
      </Row>
    </ListGroupItem>
  )
}

export default QuestionListItem