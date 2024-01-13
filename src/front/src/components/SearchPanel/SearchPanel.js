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
        selectedMessenger,
        setSelectedMessenger,
        selectedObject,
        setSelectedObject,
        setCoordinates
    } = useContext(SearchParamsContext);


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
        const {text, ra, dec, ang} = parseAndCleanCoordinates(transientName);
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
                    <TransientInput placeholder={"Name"}/>
            </div>
            <div className="input-group coordinates">
                    <CoordinatesInput placeholder={"Coordinates"}/>
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
            <SearchButton/>
        </div>
    );
}

export default SearchPanel;
