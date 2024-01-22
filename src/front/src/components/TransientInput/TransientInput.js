import React, { useContext } from 'react';
import './TransientInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import {parseAndCleanCoordinates} from "../parseCoordinatesUtility";
import FlowInput from "../FlowInput/FlowInput";

function TransientInput({ placeholder }) {
    const { transientName, setTransientName } = useContext(SearchParamsContext);


    const handleTransientChange = (event) => {
        const name = event.target.value;
        setTransientName(name);
    };

    return (

            <FlowInput
                id="transient"
                value={transientName || ""}
                placeholder={placeholder}
                minWidth={80}
                maxWidth={700}
                onChange={handleTransientChange}
            />


    );
}


export default TransientInput;
