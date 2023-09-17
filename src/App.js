import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StarMapPage from './pages/StarMapPage/StarMapPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/starmap" element={<StarMapPage />} />
            </Routes>
        </Router>
    );
}

export default App;
