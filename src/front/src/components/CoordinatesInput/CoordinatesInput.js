import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoordinatesInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import FlowInput from '../../components/FlowInput/FlowInput';
function CoordinatesInput({ placeholder }) {
    const navigate = useNavigate();
    const { ra, setRa, dec, setDec, ang, setAng } = useContext(SearchParamsContext);

    // Обработчики для изменения каждой координаты
    const handleRaChange = (event) => {
        setRa(event.target.value);
    };

    const handleDecChange = (event) => {
        setDec(event.target.value);
    };

    const handleAngChange = (event) => {
        setAng(event.target.value);
    };

    return (
        <div className="coordinatesContainer">
            <div className="coordinatesLabel"> Coordinates: </div>
            <FlowInput
                id="ra-input"
                placeholder="RA"
                value={ra || ''}
                minWidth={50}
                onChange={handleRaChange}
            />
            <FlowInput
                id="dec-input"
                placeholder="DEC"
                value={dec || ''}
                minWidth={65}
                onChange={handleDecChange}
            />
            <FlowInput
                id="ang-input"
                placeholder="ANG"
                value={ang || ''}
                minWidth={65}
                onChange={handleAngChange}
            />
        </div>
    );
}

export default CoordinatesInput;
