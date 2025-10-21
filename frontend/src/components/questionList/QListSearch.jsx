import { useState } from 'react';
import { Form, Button, InputGroup} from 'react-bootstrap';

const QListSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search action
  const handleSearch = () => {
    console.log('Search query:', searchQuery);
    // Pass the search query to parent component
    if (onSearch) {
      onSearch(searchQuery);
    }
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

export default QListSearch;