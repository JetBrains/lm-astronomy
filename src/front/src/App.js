import React, { useState }  from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StarMapPage from './pages/StarMapPage/StarMapPage';
import CoordinatesContext from './components/Contexts/CoordinatesContext';
import MessagePage from './pages/MessagePage/MessagePage';
import { MessageProvider } from './components/Contexts/MessageContext';

function App() {
    const [coordinates, setCoordinates] = useState(null);
    const [transient, setTransient] = useState("");
    const [selectedMessenger, setSelectedMessenger] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);


    return (
        <CoordinatesContext.Provider value={{
            coordinates: coordinates,
            setCoordinates: setCoordinates,
            transient: transient,
            setTransient: setTransient,
            selectedMessenger: selectedMessenger,
            setSelectedMessenger: setSelectedMessenger,
            selectedObject: selectedObject,
            setSelectedObject: setSelectedObject
        }}>
            <Router>
                <MessageProvider>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/starmap" element={<StarMapPage />} />
                        <Route path="/message" element={<MessagePage />} />
                    </Routes>
                </MessageProvider>
            </Router>
        </CoordinatesContext.Provider>
    );
}

export default App;