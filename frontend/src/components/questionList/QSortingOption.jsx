import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { SORT_OPTIONS, SORT_DEFAULT } from './questionListConfig';

const QSortingOption = ({ sortOption = SORT_DEFAULT, onChange }) => {
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
