import React, { useState, useEffect, useContext } from 'react';
import './SearchPanel.css';
import { MessageContext } from '../Contexts/MessageContext';
import { useNavigate } from 'react-router-dom';
import ObjectSelect from '../ObjectSelect/ObjectSelect';
import MessengerType from '../MessengerType/MessengerType';
import SearchButton from "../SearchButton/SearchButton";
import {searchAPI} from "../../api/apiServices";
import TransientInput from '../TransientInput/TransientInput';
import CoordinatesContext from '../Contexts/CoordinatesContext';
import { parseAndCleanCoordinates } from '../parseCoordinatesUtility';

function SearchPanel() {
    const {
        coordinates,
        transient,
        setTransient,
        selectedMessenger,
        setSelectedMessenger,
        selectedObject,
        setSelectedObject,
        setCoordinates
    } = useContext(CoordinatesContext);
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = !transient && !selectedObject && !selectedMessenger && (!coordinates || (coordinates[0] === null && coordinates[1] === null && coordinates[2] === null));
    const { setMessagesData } = useContext(MessageContext);
    const navigate = useNavigate();
    const handleSearch = () => {
        if (!transient && !selectedObject && !selectedMessenger && (!coordinates || (coordinates[0] === null && coordinates[1] === null && coordinates[2] === null))) {
            console.log("Search not performed: all fields are empty");
            return;
        }
        const { text, ra, dec, ang } = parseAndCleanCoordinates(transient);
        setIsLoading(true);
        searchAPI(text, ra, dec, ang, selectedObject, selectedMessenger, setMessagesData)
            .then((data) => {
                if (data) {
                    // console.log(data.atel);
                    setMessagesData(data);

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
        setTransient(inputString);
    };

    const handleTransientBlur = (e) => {
        const { ra, dec, ang, text } = parseAndCleanCoordinates(e.target.value);
        if (ra !== null && dec !== null && ang !== null) {
            setCoordinates([ra, dec, ang]);
        }
        setTransient(text);
    };
    useEffect(() => {
        if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0 && coordinates[2] !== 30) {
            const coordsString = `RA:${coordinates[0]} DEC:${coordinates[1]} ANG:${coordinates[2]}`;

            const regex = /RA\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|DEC\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|ANG\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/gi;
            let cleanedTransient = transient.replace(regex, '').replace(/,{2,}/g, ',').trim();

            // Remove trailing commas and spaces after cleaning
            cleanedTransient = cleanedTransient.replace(/^[\s,]+|[\s,]+$/g, '');

            const newTransient = cleanedTransient ? `${cleanedTransient}, ${coordsString}` : coordsString;
            setTransient(newTransient);
        }
    }, [coordinates]);

    return (
        <div className="search-panel">
            <TransientInput
                onTransientChange={handleTransientChange}
                onBlur={handleTransientBlur}
            />
            <div className="input-group">
                <ObjectSelect onObjectChange={handleObjectChange} />
            </div>
            <div className="input-group">
                <MessengerType onMessengerChange={handleMessengerChange} />
            </div>
            <SearchButton onSearch={handleSearch} isLoading={isLoading} isDisabled={isDisabled} />
        </div>
    );
}

export default SearchPanel;
