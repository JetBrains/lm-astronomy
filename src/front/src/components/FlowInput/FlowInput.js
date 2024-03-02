import React, { useState, useEffect, useRef } from 'react';
import './FlowInput.scss';

function FlowInput({ id, placeholder, onChange, onBlur, value, minWidth, maxWidth = 310 }) {
    const [inputWidth, setInputWidth] = useState(minWidth);
    const spanRef = useRef(null);

    useEffect(() => {
        const spanWidth = spanRef.current.offsetWidth;
        const newWidth = Math.max(spanWidth, minWidth);
        setInputWidth(newWidth);
    }, [value, minWidth]);

    return (
        <div className='flow-input-container'>
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                style={{ width: `${inputWidth}px`, maxWidth }}
                className="flow-input"
            />
            <span ref={spanRef} className="hidden-span">{value}</span>
        </div>
    );
}

export default FlowInput;
