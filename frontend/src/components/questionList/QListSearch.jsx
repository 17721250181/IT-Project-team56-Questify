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

  // Handle clear search
  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
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
            <Button 
                variant="outline-secondary" 
                onClick={handleClear}
                title="Clear search"
            >
                <i className="bi bi-x-lg"></i>
            </Button>
        </InputGroup>
    </Form>
  );
};

export default QListSearch;