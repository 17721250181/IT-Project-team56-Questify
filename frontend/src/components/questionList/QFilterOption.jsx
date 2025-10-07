import { React, useState, useRef } from 'react';
import { Button, Overlay, Tooltip } from 'react-bootstrap';

const QFilterOption = () => {

    const [show, setShow] = useState(false);
    const target = useRef(null);

    return (
        <>
            <Button className='m-1' ref={target} onClick={() => setShow(!show)}>
                Filter
            </Button>
            <Overlay target={target.current} show={show} placement="right">
                {(props) => (
                <Tooltip id="overlay-example" {...props}>
                    Implement Filter here
                </Tooltip>
                )}
            </Overlay>
        </>
    );
}

export default QFilterOption