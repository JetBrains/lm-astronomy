import React, {useContext, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './CoordinatesInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';

function CoordinatesInput({ placeholder }) {
    const navigate = useNavigate();
    const { ra, setRa, dec, setDec, ang, setAng } = useContext(SearchParamsContext);

    const handleCoordinatesChange = (event) => {
        const coordinates = parseCoordinates(event.target.value);
        setRa(coordinates[0]);
        setDec(coordinates[1]);
        setAng(coordinates[2]);

    };

    const handleIconClick = () => {
        navigate('/starmap');
    };

    const parseCoordinates = (inputString) => {
        const regex = /RA:\s*(-?\d+(\.\d+)?)\s*DEC:\s*(-?\d+(\.\d+)?)\s*ANG:\s*(\d+(\.\d+)?)/g;
        const match = regex.exec(inputString);

        if (match) {
            const ra = parseFloat(match[1]);
            const dec = parseFloat(match[3]);
            const ang = parseFloat(match[5]);

            return [ra, dec, ang];
        }

        return [null, null, null];
    };



    return (
            <input
                id="coords"
                placeholder={placeholder}
                onChange={handleCoordinatesChange}
            />
    );
}

export default CoordinatesInput;