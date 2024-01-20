import React, {useState, useEffect, useContext} from 'react';
import './SearchPanel.css';
import {MessageContext} from '../Contexts/MessageContext';
import {useNavigate} from 'react-router-dom';
import ObjectSelect from '../PhysicalObjectSelect/PhysicalObjectSelect';
import EventSelect from '../EventSelect/EventSelect';
import MessengerType from '../MessengerType/MessengerType';
import SearchButton from "../SearchButton/SearchButton";
import {searchAPI} from "../../api/apiServices";
import TransientInput from '../TransientInput/TransientInput';
import CoordinatesInput from '../CoordinatesInput/CoordinatesInput';
import AstromapIcon from '../AstromapIcon/AstromapIcon';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import {parseAndCleanCoordinates} from '../parseCoordinatesUtility';

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
        eventType,
        setEventType,
        physicalObject,
        setPhysicalObject,
        messengerType,
        setMessengerType

    } = useContext(SearchParamsContext);


    // const {  } = useContext(SearchParamsContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    // console.log(!transientName && !selectedObject && !selectedMessenger && !selectedEvent && (!ra && dec && ang || (ra === null && dec === null && ang === null)));
    // const { setMessagesData } = useContext(MessageContext);
    const navigate = useNavigate();
    const handleSearch = () => {
        setIsLoading(true);

        // Вызов searchAPI с текущими параметрами поиска
        searchAPI(transientName, ra, dec, ang, physicalObject, eventType, messengerType)
            .then((data) => {
                // Обработка полученных данных
                // setMessagesData(data); // предполагается, что это функция для обновления состояния сообщений
                navigate("/results"); // Например, перенаправление на страницу с результатами
            })
            .catch((error) => {
                console.error("Search failed:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // const handleObjectChange = (selectedObjectValue) => {
    //     setSelectedObject(selectedObjectValue);
    // };

    // const handleMessengerChange = (selectedMessengerType) => {
    //     setSelectedMessenger(selectedMessengerType);
    // };

    useEffect(() => {

         setIsDisabled(!transientName && !physicalObject && !messengerType && !eventType && !(ang && ra && dec));

    })

    useEffect(() => {


        if (ra && dec && ang || (ra !== 0 && dec !== 0 && ang !== 30)) {
            const coordsString = `RA:${ra} DEC:${dec} ANG:${ang}`;

            const regex = /RA\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|DEC\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*|ANG\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/gi;
            let cleanedTransient = transientName.replace(regex, '').replace(/,{2,}/g, ',').trim();

            // Remove trailing commas and spaces after cleaning
            cleanedTransient = cleanedTransient.replace(/^[\s,]+|[\s,]+$/g, '');

            const newTransient = cleanedTransient ? `${cleanedTransient}, ${coordsString}` : coordsString;
            // setTransientName(newTransient);
        }
    }, [ra, dec, ang]);

    return (
        <div className="search-panel">
            <div className="input-group transient">
                <div className="transientContainer">
                    <div className="label"> Transient: </div>
                    <TransientInput placeholder={"Name"}/>
                </div>
            </div>
            <div className="input-group coordinates">
                <div className="coordinatesContainer">
                    <div className="label">Coordinates:</div>
                    <CoordinatesInput />
                </div>
                    <AstromapIcon className={"astromap"}/>
            </div>
            <div className="input-group">
                <ObjectSelect placeholder={"physical object"}/>
            </div>
            <div className="input-group">
                <EventSelect placeholder={"event type"}/>
            </div>
            <div className="input-group">
                <MessengerType/>
            </div>
            <SearchButton onSearch={handleSearch} loading={isLoading} disabled={isDisabled} />
        </div>
    );
}

export default SearchPanel;
