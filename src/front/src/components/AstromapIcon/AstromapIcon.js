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
            <svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="currentColor"
                 className="bi bi-map" viewBox="2 2 55 55">
                <path className="st0" d="M30,55.1c-7.3,0-13.3-11.8-13.3-26.3h1c0,13.9,5.5,25.3,12.3,25.3c6.8,0,12.3-11.3,12.3-25.3S36.7,3.6,30,3.6
	c-3.6,0-7,3.3-9.4,9l-0.9-0.4c2.5-6.1,6.3-9.6,10.3-9.6c7.3,0,13.3,11.8,13.3,26.3S37.3,55.1,30,55.1z"/>
                <path className="st0" d="M30,42.1c-14.5,0-26.3-6-26.3-13.3c0-4,3.5-7.8,9.6-10.3l0.4,0.9c-5.7,2.4-9,5.8-9,9.4
	C4.7,35.6,16,41.1,30,41.1s25.3-5.5,25.3-12.3c0-6.8-11.3-12.3-25.3-12.3v-1c14.5,0,26.3,6,26.3,13.3S44.5,42.1,30,42.1z"/>
                <path className="st0"
                      d="M19.9,14.5l1.5,2.8l2.8,1.5l-2.8,1.5l-1.5,2.8l-1.5-2.8l-2.8-1.5l2.8-1.5L19.9,14.5z"/>
                <line className="st1" x1="-88.7" y1="77.9" x2="-37.1" y2="77.9"/>
                <line className="st1" x1="-104.2" y1="93.1" x2="-104.2" y2="41.4"/>
                <line className="st1" x1="-69.7" y1="-14" x2="-29.4" y2="-14"/>
                <line className="st1" x1="-72.2" y1="62.2" x2="-61.4" y2="62.2"/>
                <line className="st1" x1="-35.5" y1="71.7" x2="-25.4" y2="71.7"/>
                <line className="st1" x1="-85.8" y1="67.7" x2="-65" y2="67.7"/>
            </svg>
        </div>

    );
}

export default AstromapIcon;