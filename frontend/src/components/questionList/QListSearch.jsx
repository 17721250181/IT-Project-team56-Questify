import { useState } from 'react';
import { Form, Button, InputGroup} from 'react-bootstrap';

const QListSearch = ({ onSearch, currentSearch = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search action
  const handleSearch = () => {
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
        <InputGroup style={{ borderRadius: '10px', overflow: 'hidden' }}>
            <InputGroup.Text
                style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRight: 'none'
                }}
            >
                <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                style={{
                    border: '1px solid #e5e7eb',
                    borderLeft: 'none',
                    borderRight: 'none',
                    fontSize: '0.938rem'
                }}
            />
            <Button
                variant="primary"
                type="submit"
                style={{
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    borderTopRightRadius: currentSearch ? '0' : '10px',
                    borderBottomRightRadius: currentSearch ? '0' : '10px',
                    fontWeight: '600',
                    padding: '0.5rem 1.25rem'
                }}
            >
                Search
            </Button>
            {currentSearch && (
                <Button
                    variant="outline-secondary"
                    onClick={handleClear}
                    title="Clear search"
                    style={{
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                        borderLeft: 'none'
                    }}
                >
                    <i className="bi bi-x-lg"></i>
                </Button>
            )}
        </InputGroup>
    </Form>
  );
};

export default QListSearch;