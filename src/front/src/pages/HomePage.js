// import React from 'react';
import React, { useContext } from 'react';
import Header from '../components/Header/Header';
import SearchPanel from '../components/SearchPanel/SearchPanel';
import './index.css';


import SearchParamsContext from '../components/Contexts/SearchParamsContext';
import messengerType from "../components/MessengerType/MessengerType";



function HomePage() {

    // const { transientName, ra, dec, ang, physicalObject, eventType, messengerType} = useContext(SearchParamsContext);
    // if(transientName || ra || dec || ang || physicalObject || messengerType || eventType) {
    //     console.log("transientName = ", transientName);
    //     console.log("ra = ", ra);
    //     console.log("dec = ", dec);
    //     console.log("ang = ", ang);
    //     console.log("physicalObject = ", physicalObject);
    //     console.log("eventType = ", eventType);
    //     console.log("messengerType = ", messengerType);
    // }


    return (
        <div className="app-container font-base">
            <div className="container">
                <Header />
                <SearchPanel />

            </div>
        </div>
    );
}

export default HomePage;
