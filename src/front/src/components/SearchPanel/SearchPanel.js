import React, { useState, useEffect, useContext } from 'react';
import './SearchPanel.css';
import { MessageContext } from '../Contexts/MessageContext';
import { useNavigate } from 'react-router-dom';
import ObjectSelect from '../ObjectSelect/ObjectSelect';
import MessengerType from '../MessengerType/MessengerType';
import SearchButton from "../SearchButton/SearchButton";
import {searchAPI} from "../../api/apiServices";
import TransientInput from '../TransientInput/TransientInput';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import { parseAndCleanCoordinates } from '../parseCoordinatesUtility';

function SearchPanel() {
    const {
        transientName,
        setTransientName,
        ra,
        setRa,
        dec,
        setDec,
        ang,
        setAng,
        selectedMessenger,
        setSelectedMessenger,
        selectedObject,
        setSelectedObject,
        setCoordinates
    } = useContext(SearchParamsContext);

    // const coordinates = null;
    // const transient = null;
    // const setTransient = null;
    //  const    selectedMessenger= null;
    //  const    setSelectedMessenger= null;
    //  const    selectedObject= null;
    // const     setSelectedObject= null;
    //  const    setCoordinates = null;

    // const {  } = useContext(SearchParamsContext);
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = !transientName && !selectedObject && !selectedMessenger && (!ra && dec && ang || (ra === null && dec === null && ang === null));
    // const { setMessagesData } = useContext(MessageContext);
    const navigate = useNavigate();
    const handleSearch = () => {
        if (!transientName && !selectedObject && !selectedMessenger && (!ra && dec && ang || (ra === null && dec === null && ang === null))) {
            console.log("Search not performed: all fields are empty");
            return;
        }
        const { text, ra, dec, ang } = parseAndCleanCoordinates(transientName);
        setIsLoading(true);
        searchAPI(text, ra, dec, ang, selectedObject, selectedMessenger)
            .then((data) => {
                if (data) {
                    // console.log(data.atel);
                    // setMessagesData(data);

                } else {
                    console.log("Incorrect data format:", data);
                }
                navigate("/message");
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error)
                setIsLoading(false);
            })
    };

    const handleObjectChange = (selectedObjectValue) => {
        setSelectedObject(selectedObjectValue);
    };

    const handleMessengerChange = (selectedMessengerType) => {
        setSelectedMessenger(selectedMessengerType);
    };


    const handleTransientChange = (e) => {
        const inputString = e.target.value;
        setTransientName(inputString);
    };

    const handleTransientBlur = (e) => {
        const { ra, dec, ang, text } = parseAndCleanCoordinates(e.target.value);
        if (ra !== null && dec !== null && ang !== null) {
            setRa(ra);
            setDec(dec);
            setAng(ang);
        }
        setTransientName(text);
    };
    useEffect(() => {
        if (ra && dec && ang || (ra !== 0 && dec !== 0 && ang !== 30)) {
            const coordsString = `RA:${ra} DEC:${dec} ANG:${ang}`;

            const regex = /RA\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|DEC\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|ANG\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/gi;
            let cleanedTransient = transientName.replace(regex, '').replace(/,{2,}/g, ',').trim();

            // Remove trailing commas and spaces after cleaning
            cleanedTransient = cleanedTransient.replace(/^[\s,]+|[\s,]+$/g, '');

            const newTransient = cleanedTransient ? `${cleanedTransient}, ${coordsString}` : coordsString;
            setTransientName(newTransient);
        }
    }, [ra, dec, ang]);

    return (
        <div className="search-panel">
            <TransientInput
                onTransientChange={handleTransientChange}
                onBlur={handleTransientBlur}
            />
            {/*<div className="input-group">*/}
            {/*    <ObjectSelect onObjectChange={handleObjectChange} />*/}
            {/*</div>*/}
            {/*<div className="input-group">*/}
            {/*    <MessengerType onMessengerChange={handleMessengerChange} />*/}
            {/*</div>*/}
            {/*<SearchButton onSearch={handleSearch} isLoading={isLoading} isDisabled={isDisabled} />*/}
        </div>
    );
}

export default SearchPanel;
