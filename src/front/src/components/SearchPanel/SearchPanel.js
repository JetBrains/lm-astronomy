import React, { useState, useEffect, useContext } from 'react';
import './SearchPanel.css';
import { MessageContext } from '../Contexts/MessageContext';
import { useNavigate } from 'react-router-dom';
import ObjectSelect from '../ObjectSelect/ObjectSelect';
import MessengerType from '../MessengerType/MessengerType';
import SearchButton from "../SearchButton/SearchButton";
import {searchAPI} from "../../api/apiCalls";
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
    const { setMessageIds } = useContext(MessageContext);
    const navigate = useNavigate();
    const handleSearch = () => {
        if (!transient && !selectedObject && !selectedMessenger && (!coordinates || (coordinates[0] === null && coordinates[1] === null && coordinates[2] === null))) {
            console.log("Поиск не выполнен: все поля пусты");
            return;
        }
        setIsLoading(true);
            searchAPI(transient, selectedObject, selectedMessenger, coordinates)
                .then((data) => {
                    if (data && data.ATel && data.GCN) {
                        setMessageIds({ ATel: data.ATel, GCN: data.GCN });

                    } else {
                        console.log("Неправильный формат данных:", data);
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
    const parseCoordinates = (inputString) => {
        const regex = /RA:\s*(-?\d+(\.\d+)?)\s*,?\s*DEC:\s*(-?\d+(\.\d+)?)\s*,?\s*ANG:\s*(\d+(\.\d+)?)/;
        const match = regex.exec(inputString);

        if (match) {
            const ra = parseFloat(match[1]);
            const dec = parseFloat(match[3]);
            const ang = parseFloat(match[5]);

            return [ra, dec, ang];
        }

        return [null, null, null];
    };




    const handleTransientChange = (e) => {
        const inputString = e.target.value;
        setTransient(inputString);
    };


    const handleTransientBlur = (e) => {
        const inputString = e.target.value;
        const { ra, dec, ang, text } = parseAndCleanCoordinates(inputString);
        if (ra !== null && dec !== null && ang !== null) {
            setCoordinates([ra, dec, ang]);
        }
        setTransient(text);  // Если вы хотите обновить transient с очищенным текстом
    };


    useEffect(() => {
        if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
            const coordsString = `RA:${coordinates[0]} DEC:${coordinates[1]} ANG:${coordinates[2]}`;

            const regex = /RA\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|DEC\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|ANG\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/gi;
            let cleanedTransient = transient.replace(regex, '').replace(/,{2,}/g, ',').trim();

            // Удаляем концевые запятые и пробелы после очистки
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
