import { useState } from 'react';
import { Form, Button, InputGroup} from 'react-bootstrap';

const QuestionListSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search action
  const handleSearch = () => {
    console.log('Search query:', searchQuery);
    // Add your search logic here
    // For example: call an API or pass it to a parent component
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <Form onSubmit={handleSubmit}>
        <InputGroup>
            <Form.Control
                type="text"
                placeholder="Search questions"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Button variant="primary" type="submit">
                Search
            </Button>
        </InputGroup>
    </Form>
  );
};

export default QuestionListSearch;