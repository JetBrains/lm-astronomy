import React, {useContext} from 'react';
import './TransientInput.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import FlowInput from "../FlowInput/FlowInput";

function TransientInput({placeholder}) {
    const {transientName, setTransientName} = useContext(SearchParamsContext);


    const handleTransientChange = (event) => {
        const name = event.target.value;
        setTransientName(name);
    };

    return (
        <div className='flow-input-container'>
            <input
                id="transient"
                type="text"
                placeholder={placeholder}
                onChange={handleTransientChange}
            />

        </div>



)
    ;
}


export default TransientInput;
