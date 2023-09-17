import React, { useState, useEffect } from 'react';
import './SearchPanel.css';
import ObjectSelect from '../ObjectSelect/ObjectSelect';
import MessengerType from '../MessengerType/MessengerType';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchButton from "../SearchButton/SearchButton";
import {searchAPI} from "../../api/apiCalls";

function SearchPanel() {
    const navigate = useNavigate();
    const location = useLocation();
    const [inputValue, setInputValue] = useState('');
    const [selectedMessenger, setSelectedMessenger] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null); // Добавлено

    const handleSearch = () => {
        const transientName = inputValue;
        const physicalPhenomena = selectedObject;
        const messengerType = selectedMessenger;
        const frequency = null; // Пока что null, так как у вас нет компонента для частоты

        searchAPI(transientName, physicalPhenomena, messengerType, frequency);
    };

    const handleIconClick = () => {
        navigate('/starmap');
    };

    const handleObjectChange = (selectedObjectValue) => {
        setSelectedObject(selectedObjectValue);
    };

    const handleMessengerChange = (selectedMessengerType) => {
        setSelectedMessenger(selectedMessengerType);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const coords = params.get('coords');
        if (coords) {
            setInputValue(coords.replace(';', ' '));
        }
    }, [location.search]);

    return (
        <div className="search-panel">
            <div className="input-group">
                <input id="name" className="input-field" value={inputValue} placeholder="Transient name or coordinates" onChange={e => setInputValue(e.target.value)} />
                <div onClick={handleIconClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                         className="bi bi-map" viewBox="0 0 16 16">
                        <path d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
                    </svg>
                </div>
            </div>
            <div className="input-group">
                <ObjectSelect onObjectChange={handleObjectChange} />
            </div>
            <div className="input-group">
                <MessengerType onMessengerChange={handleMessengerChange} />
            </div>
            <SearchButton onSearch={handleSearch} />
        </div>
    );
}

export default SearchPanel;
