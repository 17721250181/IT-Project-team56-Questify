import React from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * Pagination Component
 * Reusable pagination control with intelligent page number display
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} maxVisiblePages - Maximum number of page buttons to show (default: 5)
 */
const QuestionPagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    maxVisiblePages = 5 
}) => {
    // Don't render if only one page or no pages
    if (totalPages <= 1) {
        return null;
    }

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max
            for (let number = 1; number <= totalPages; number++) {
                items.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => onPageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }
        } else {
            // Show first page
            items.push(
                <Pagination.Item
                    key={1}
                    active={1 === currentPage}
                    onClick={() => onPageChange(1)}
                >
                    1
                </Pagination.Item>
            );

            // Show ellipsis if needed
            if (currentPage > 3) {
                items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let number = start; number <= end; number++) {
                items.push(
                    <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => onPageChange(number)}
                    >
                        {number}
                    </Pagination.Item>
                );
            }

            // Show ellipsis if needed
            if (currentPage < totalPages - 2) {
                items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            }

            // Show last page
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={totalPages === currentPage}
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    return (
        <div className="d-flex justify-content-center mb-3">
            <Pagination>
                <Pagination.First
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                />
                <Pagination.Prev
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {getPaginationItems()}
                <Pagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
                <Pagination.Last
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
};

export default QuestionPagination;
