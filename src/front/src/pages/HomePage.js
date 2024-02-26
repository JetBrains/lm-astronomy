// import React from 'react';
import React from 'react';
import Header from '../components/Header/Header';
import SearchPanel from '../components/SearchPanel/SearchPanel';
import './index.css';

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
