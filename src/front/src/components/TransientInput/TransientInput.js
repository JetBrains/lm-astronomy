import React, { useContext } from 'react';
import './TransientInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import {parseAndCleanCoordinates} from "../parseCoordinatesUtility";

function TransientInput({ placeholder }) {
    const { transientName, setTransientName } = useContext(SearchParamsContext);


    const handleTransientChange = (event) => {
        const name = event.target.value;
        setTransientName(name);
    };

    return (

            <input
                id="name"
                value={transientName || ""}
                placeholder={placeholder}
                onChange={handleTransientChange}
            />
    );
}


export default TransientInput;
