import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import StarMapPage from './pages/StarMapPage/StarMapPage';
import MessagePage from './pages/MessagePage/MessagePage';
import {MessageProvider} from './components/Contexts/MessageContext';
import {SearchParamsProvider} from "./components/Contexts/SearchParamsContext";

function App() {


    return (

        <SearchParamsProvider>
            <MessageProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/starmap" element={<StarMapPage/>}/>
                        <Route path="/messages" element={<MessagePage/>}/>
                    </Routes>
                </Router>
            </MessageProvider>
        </SearchParamsProvider>

    );
}

export default App;