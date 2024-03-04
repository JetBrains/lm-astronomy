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
import Coordinates from '../Coordinates/Coordinates';
import AstromapIcon from '../AstromapIcon/AstromapIcon';
import SearchParamsContext from '../Contexts/SearchParamsContext';


function SearchPanel() {
    const {
        transientName, ra, dec, ang, eventType, physicalObject, messengerType
    } = useContext(SearchParamsContext);

    const [windowHeightClass, setWindowHeightClass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
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

    // useEffect(() => {
    //     setIsDisabled(!transientName && !physicalObject && !messengerType && !eventType && !(ang && ra && dec));
    // })

    const handleResize = () => {
        if (window.innerHeight > 1200) {
            setWindowHeightClass('extra-large-window');
        } else if (window.innerHeight > 900) {
            setWindowHeightClass('large-window');
        } else {
            setWindowHeightClass('');
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Инициализируем при монтировании
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (

        <div className={`search-panel ${windowHeightClass}`}>

            <div className="input-group transient">
            <div className="transientContainer">
                <TransientInput placeholder={"Transient Name"}/>
            </div>
        </div>

        <div className="input-group event">
            <div className="eventType">
                <EventSelect placeholder={"Event type"}/>
            </div>
        </div>



        <div className="input-group object">
            <div className="objectContainer">
                <ObjectSelect placeholder={"Physical Object"}/>
            </div>
        </div>
        <div className="input-group messenger">
            <div className="messengerType">
                <MessengerType placeholder={"Messenger Type"}/>
            </div>
        </div>
        <div className="input-group coordinates">
            <div className="coordinatesContainer">
                <label htmlFor={"ra-input"} className="label">Coordinates: </label>
                <CoordinatesInput/>
            </div>
            <AstromapIcon className={"astromap"}/>
        </div>
        {/*<div className="input-group coordinates">*/}
        {/*    <div className="coordinatesContainer">*/}
        {/*        <Coordinates placeholder={"ICRS Coordinates"}/>*/}
        {/*    </div>*/}
        {/*    <AstromapIcon className={"astromap"}/>*/}
        {/*</div>*/}
        <SearchButton onSearch={handleSearch} loading={isLoading} disabled={isDisabled}/>
    </div>);
}

export default SearchPanel;
