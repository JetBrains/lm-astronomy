import React from 'react';
import {useNavigate} from 'react-router-dom';
import './AstromapIcon.css';

function AstromapIcon({className}) {
    const navigate = useNavigate();


    const handleIconClick = () => {
        navigate('/starmap');
    };


    return (
        <div onClick={handleIconClick} className={"icon-container " + className}>
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor"
                 className="bi bi-map" viewBox="1 1 37 37">
                <path className="st0" d="M19.4,37.6c-10,0-18.2-8.2-18.2-18.2c0-10,8.2-18.2,18.2-18.2c10,0,18.2,8.2,18.2,18.2
		C37.6,29.5,29.4,37.6,19.4,37.6z M19.4,2.3C9.9,2.3,2.2,10,2.2,19.4s7.7,17.2,17.2,17.2c9.5,0,17.2-7.7,17.2-17.2
		S28.9,2.3,19.4,2.3z"/>
                <path className="st0" d="M19.4,37.6c-5.3,0-9.7-8.2-9.7-18.2c0-10,4.3-18.2,9.7-18.2c5.3,0,9.7,8.2,9.7,18.2
		C29.1,29.5,24.7,37.6,19.4,37.6z M19.4,2.3c-4.8,0-8.7,7.7-8.7,17.2s3.9,17.2,8.7,17.2s8.7-7.7,8.7-17.2S24.2,2.3,19.4,2.3z"/>
                <rect x="18.8" y="1.5" className="st0" width="1" height="35.8"/>
                <rect x="1.7" y="18.5" className="st0" width="35.5" height="1"/>
                <rect x="4.1" y="9.8" className="st0" width="30.9" height="1"/>
                <rect x="3.4" y="27.2" className="st0" width="31.3" height="1"/>
                <circle className="st0" cx="6.6" cy="14.7" r="1.3"/>
            </svg>
        </div>

    );
}

export default AstromapIcon;