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


function SearchPanel() {
    const {
        transientName, ra, dec, ang, eventType, physicalObject, messengerType
    } = useContext(SearchParamsContext);

    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [page, setPage] = useState(1);
    const {setMessagesData, setTotalMessages} = useContext(MessageContext);

    const navigate = useNavigate();
    const handleSearch = () => {
        setIsLoading(true);

        searchAPI(transientName, ra, dec, ang, physicalObject, eventType, messengerType, page)
            .then((data) => {
                setMessagesData(data.records);
                setTotalMessages(data.total);
                navigate("/messages");
            })
            .catch((error) => {
                console.error("Search failed:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };


    useEffect(() => {
        setIsDisabled(!transientName && !physicalObject && !messengerType && !eventType && !(ang && ra && dec));
    })


    return (<div className="search-panel">
            <div className="input-group transient">
                <div className="transientContainer">
                    <label htmlFor={"transient"} className="label"> Transient: </label>
                    <TransientInput placeholder={"Name"}/>
                </div>
            </div>
            <div className="input-group coordinates">
                <div className="coordinatesContainer">
                    <label htmlFor={"ra-input"} className="label">Coordinates:</label>
                    <CoordinatesInput/>
                </div>
                <AstromapIcon className={"astromap"}/>
            </div>
            <div className="input-group object">
                <div className="objectContainer">
                    <label htmlFor={"react-select-3-input"} className="label">Physical Object:</label>
                    <ObjectSelect placeholder={"select"}/>
                </div>
            </div>
            <div className="input-group event">
                <div className="eventType">
                    <label htmlFor={"react-select-5-input"} className="label">Event type:</label>
                    <EventSelect placeholder={"select"}/>
                </div>
            </div>
            <div className="input-group">
                <div className="messengerContainer">
                    <div className={`label`}> Messenger Type:</div>
                    <MessengerType/>
                </div>
            </div>
            <SearchButton onSearch={handleSearch} loading={isLoading} disabled={isDisabled}/>
        </div>);
}

export default SearchPanel;
