import React, {useContext, useEffect, useState} from 'react';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import './SearchButton.css';
import {useNavigate} from "react-router-dom";
import {searchAPI} from "../../api/apiServices";

function SearchButton({ onSearch }) {
    const navigate = useNavigate();

    const {
        transientName,
        setTransientName,
        ra,
        setRa,
        dec,
        setDec,
        ang,
        setAng,
        physicalObject,
        setPhysicalObject,
        eventType,
        setEventType,
        messengerType,
        setMessengerType,
        } = useContext(SearchParamsContext);

    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = !transientName && !physicalObject && !messengerType && (!ra && dec && ang || (ra === null && dec === null && ang === null));
    console.log(isDisabled);
    const handleSearch = () => {
        if (!transientName && !physicalObject && !messengerType && (!ra && dec && ang || (ra === null && dec === null && ang === null))) {
            console.log("Search not performed: all fields are empty");
            return;
        }
        // const { text, ra, dec, ang } = parseAndCleanCoordinates(transientName);
        setIsLoading(true);

        searchAPI(transientName, ra, dec, ang, physicalObject, messengerType, eventType)
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

    return (
        <div className={`search-button ${isLoading ? 'loading' : ''} ${isDisabled ? 'disabled' : ''}`}  onClick={handleSearch}>
            <span className="search-text">SEARCH</span>
            <div className="icons-container">
                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z" stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${isLoading ? "pupil-spinning" : ""}`} cx="32.0001" cy="36.0006" r="8.78571" stroke="black" strokeWidth="3"/>
                </svg>

                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z" stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${isLoading ? "pupil-spinning" : ""}`} cx="42.0001" cy="52.0006" r="8.78571" stroke="black" strokeWidth="3"/>
                </svg>

                <svg className="search-icon" width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="42" cy="42" r="40.5" stroke="black" strokeWidth="3"/>
                    <path d="M82.5 42.8566C82.5 49.4991 78.241 55.7313 70.8965 60.3778C63.5709 65.0124 53.3584 67.928 42 67.928C30.6416 67.928 20.4291 65.0124 13.1035 60.3778C5.75899 55.7313 1.5 49.4991 1.5 42.8566C1.5 36.214 5.75899 29.9819 13.1035 25.3354C20.4291 20.7008 30.6416 17.7852 42 17.7852C53.3584 17.7852 63.5709 20.7008 70.8965 25.3354C78.241 29.9819 82.5 36.214 82.5 42.8566Z" stroke="black" strokeWidth="3"/>
                    <circle className={`pupil ${isLoading ? "pupil-spinning" : ""}`} cx="52.0001" cy="36.0006" r="8.78571" stroke="black" strokeWidth="3"/>
                </svg>
            </div>
        </div>
    );
}

export default SearchButton;
