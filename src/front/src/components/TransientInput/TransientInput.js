import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransientInput.css';
import CoordinatesContext from '../Contexts/CoordinatesContext';

function TransientInput({ onTransientChange, onBlur }) {
    const navigate = useNavigate();
    const { transient, setTransient, setCoordinates } = useContext(CoordinatesContext);

    const handleIconClick = () => {
        navigate('/starmap');
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setTransient(value);
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



    const handleTransientChange = (event) => {
        const coords = event.target.value;
        setTransient(coords);
    };


    const handleTransientBlur = (e) => {
        const inputString = e.target.value;
        const [ra, dec, ang] = parseCoordinates(inputString);
        if (ra !== null && dec !== null && ang !== null) {
            setCoordinates([ra, dec, ang]);
        }
    };



    return (
        <div className="input-group">
            <input
                id="name"
                className="input-field"
                value={transient || ""}
                placeholder="Transient name or coordinates"
                onChange={handleTransientChange}
                onBlur={handleTransientBlur}
            />
            <div onClick={handleIconClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                     className="bi bi-map" viewBox="0 0 16 16">
                    <path d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
                </svg>
            </div>
        </div>
    );
}

export default TransientInput;
