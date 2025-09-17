import React from 'react'
import { Badge, ListGroupItem } from 'react-bootstrap'

const QuestionListItem = ({ 
    title='Question Title',
    week='Week 0', 
    attempted=false, 
    questionType='undefined type',
    rating = 0.0,
    correctness = 0.0,
    numAttempts = 0
}) => {
  return (
    <ListGroupItem className='p-1 border-bottom'>
        <h6 className='float-start mb-0'>
            {title}&nbsp;
            <Badge className='m-1' bg='secondary'>{week}</Badge>
            <Badge className='m-1' bg='secondary'>{attempted ? 'Attempted✔️' : 'Not Attempted❌'}</Badge>
            <Badge className='m-1' bg='secondary'>{questionType}</Badge>
        </h6>
        <p className='float-end mb-0'>
            <Badge className='m-1' bg='info'>Rating: {rating}</Badge>
            <Badge className='m-1' bg='info'>Correctness: {correctness*100}%</Badge>
            <Badge className='m-1' bg='info'>User Attempts: {numAttempts}</Badge>
        </p>
    </ListGroupItem>
  )
}

export default QuestionListItem