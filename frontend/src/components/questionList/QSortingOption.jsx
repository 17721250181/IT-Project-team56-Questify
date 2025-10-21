import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'rating_desc', label: 'Highest rating' },
    { value: 'rating_asc', label: 'Lowest rating' },
    { value: 'attempts_desc', label: 'Most attempts' },
    { value: 'attempts_asc', label: 'Fewest attempts' },
    { value: 'author_asc', label: 'Author A → Z' },
    { value: 'author_desc', label: 'Author Z → A' },
];

const QSortingOption = ({ sortOption = 'newest', onChange }) => {
    const activeLabel = SORT_OPTIONS.find((option) => option.value === sortOption)?.label || 'Sort';

    const handleSelect = (value) => {
        onChange?.(value);
    };

    return (
        <DropdownButton
            id="question-sort-dropdown"
            title={activeLabel}
            variant="secondary"
            className="m-1"
            onSelect={handleSelect}
        >
            {SORT_OPTIONS.map((option) => (
                <Dropdown.Item
                    key={option.value}
                    eventKey={option.value}
                    active={option.value === sortOption}
                >
                    {option.label}
                </Dropdown.Item>
            ))}
        </DropdownButton>
    );
};

export default QSortingOption;
