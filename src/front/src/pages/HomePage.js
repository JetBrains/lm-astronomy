// import React from 'react';
import React, { useContext } from 'react';
import Header from '../components/Header/Header';
import SearchPanel from '../components/SearchPanel/SearchPanel';
import './index.css';


import SearchParamsContext from '../components/Contexts/SearchParamsContext';
import messengerType from "../components/MessengerType/MessengerType";



function HomePage() {

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
