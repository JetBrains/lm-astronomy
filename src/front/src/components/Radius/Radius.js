import React, { useState, useEffect, useContext, useCallback } from 'react';
import './Radius.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import FlowInput from '../../components/FlowInput/FlowInput';

const formatValueForInput = (label, value) => `${label}=${value}`;

function RadiusInput() {
    const { ra, setRa, dec, setDec, ang, setAng } = useContext(SearchParamsContext);
    const [tempAng, setTempAng] = useState('');

    useEffect(() => {
        setTempAng(ang ? formatValueForInput("ANG", ang) : '');
    }, [ang]);

    const extractNumericValue = useCallback((value) => {
        const matches = value.match(/-?\d+(\.\d+)?/g);
        return matches && matches.length === 1 ? matches[0].trim() : '';
    }, []);

    const handleBlur = useCallback((value, setState, setTempState, label) => {
        const numericValue = extractNumericValue(value);
        setState(numericValue);
        setTempState(numericValue ? formatValueForInput(label, numericValue) : '');
    }, [extractNumericValue]);

    return (
            <FlowInput
                id="ang-input"
                placeholder="Radius&deg;"
                value={tempAng}
                minWidth={405}
                onChange={(e) => setTempAng(e.target.value)}
                onBlur={() => handleBlur(tempAng, setAng, setTempAng, "ANG")}
            />
    );
}

export default RadiusInput;
