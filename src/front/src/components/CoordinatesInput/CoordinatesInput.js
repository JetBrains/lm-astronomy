import React, { useState, useEffect, useContext, useCallback } from 'react';
import './CoordinatesInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import FlowInput from '../../components/FlowInput/FlowInput';

const formatValueForInput = (label, value) => `${label}=${value}`;

function CoordinatesInput() {
    const { ra, setRa, dec, setDec, ang, setAng } = useContext(SearchParamsContext);

    const [tempRa, setTempRa] = useState('');
    const [tempDec, setTempDec] = useState('');
    const [tempAng, setTempAng] = useState('');

    useEffect(() => {
        setTempRa(ra ? formatValueForInput("RA", ra) : '');
        setTempDec(dec ? formatValueForInput("DEC", dec) : '');
        setTempAng(ang ? formatValueForInput("ANG", ang) : '');
    }, [ra, dec, ang]);

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
<>
            <FlowInput
                id="ra-input"
                placeholder="RA,"
                value={tempRa}
                minWidth={80}
                onChange={(e) => setTempRa(e.target.value)}
                onBlur={() => handleBlur(tempRa, setRa, setTempRa, "RA,")}
            />
            <FlowInput
                id="dec-input"
                placeholder="DEC,"
                value={tempDec}
                minWidth={105}
                onChange={(e) => setTempDec(e.target.value)}
                onBlur={() => handleBlur(tempDec, setDec, setTempDec, "DEC,")}
            />
            <FlowInput
                id="ang-input"
                placeholder="ANG"
                value={tempAng}
                minWidth={105}
                onChange={(e) => setTempAng(e.target.value)}
                onBlur={() => handleBlur(tempAng, setAng, setTempAng, "ANG")}
            />
        </>
    );
}

export default CoordinatesInput;
