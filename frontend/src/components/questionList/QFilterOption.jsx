import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';

export const QUESTION_FILTER_DEFAULTS = {
    week: '',
    topic: '',
    type: '',
    source: '',
    verified: false,
    minRating: 0,
    maxRating: 0,
};

const QFilterOption = ({ filters = QUESTION_FILTER_DEFAULTS, onApply, onClear, options }) => {
    const [show, setShow] = useState(false);
    const [localFilters, setLocalFilters] = useState({ ...filters });

    useEffect(() => {
        setLocalFilters({ ...filters });
    }, [filters]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        let nextValue = type === 'checkbox' ? checked : value;

        if (name === 'minRating' || name === 'maxRating') {
            nextValue = Number(nextValue);
        }

        setLocalFilters((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onApply?.({ ...localFilters });
        handleClose();
    };

    const handleClear = () => {
        setLocalFilters({ ...QUESTION_FILTER_DEFAULTS });
        onClear?.();
        handleClose();
    };

    const weekOptions = options?.weeks ?? [];
    const topicOptions = options?.topics ?? [];
    const typeOptions = options?.types ?? [];
    const sourceOptions = options?.sources ?? [];

    return (
        <>
            <Button className="m-1" onClick={handleShow}>
                Filter
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Filter Questions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col xs={12} md={6}>
                                <Form.Group controlId="filterWeek">
                                    <Form.Label>Week</Form.Label>
                                    <Form.Select
                                        name="week"
                                        value={localFilters.week}
                                        onChange={handleChange}
                                    >
                                        <option value="">All weeks</option>
                                        {weekOptions.map((week, index) => (
                                            <option key={`week-${index}-${week}`} value={week}>
                                                {week}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="filterTopic">
                                    <Form.Label>Topic</Form.Label>
                                    <Form.Select
                                        name="topic"
                                        value={localFilters.topic}
                                        onChange={handleChange}
                                    >
                                        <option value="">All topics</option>
                                        {topicOptions.map((topic, index) => (
                                            <option key={`topic-${index}-${topic}`} value={topic}>
                                                {topic}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="filterType">
                                    <Form.Label>Question Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={localFilters.type}
                                        onChange={handleChange}
                                    >
                                        <option value="">All types</option>
                                        {typeOptions.map((type, index) => (
                                            <option key={`type-${index}-${type}`} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="filterSource">
                                    <Form.Label>Source</Form.Label>
                                    <Form.Select
                                        name="source"
                                        value={localFilters.source}
                                        onChange={handleChange}
                                    >
                                        <option value="">All sources</option>
                                        {sourceOptions.map((source, index) => (
                                            <option key={`source-${index}-${source}`} value={source}>
                                                {source}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group controlId="filterMinRating">
                                    <Form.Label>Minimum Rating</Form.Label>
                                    <Form.Select
                                        name="minRating"
                                        value={localFilters.minRating}
                                        onChange={handleChange}
                                    >
                                        {[0, 1, 2, 3, 4, 5].map((value) => (
                                            <option key={value} value={value}>
                                                {value === 0 ? 'Any rating' : `${value}+`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6} className="d-flex align-items-end">
                                <Form.Check
                                    type="switch"
                                    id="filterVerified"
                                    label="Verified questions only"
                                    name="verified"
                                    checked={localFilters.verified}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-between mt-4">
                            <Button variant="outline-secondary" onClick={handleClear}>
                                Clear filters
                            </Button>
                            <Button type="submit" variant="primary">
                                Apply filters
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default QFilterOption;
