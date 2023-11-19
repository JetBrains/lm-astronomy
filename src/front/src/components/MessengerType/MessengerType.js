import React, { useContext } from 'react';
import './MessengerType.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';

function MessengerType(props) {
    const { messengerType, setMessengerType } = useContext(SearchParamsContext);

    const handleMessengerClick = (name) => {
        if (messengerType === name) {
            setMessengerType(null);
        } else {
            setMessengerType(name);
        }
    };

    const messengers = [
        { label: 'G', name: 'Gravitational Waves' },
        { label: 'γ', name: 'Electromagnetic Radiation' },
        { label: 'p', name: 'Cosmic Rays' },
        { label: 'v', name: 'Neutrinos' },
    ];





    return (
        <div className="messengerContainer">
            <div className={`messengersLabel`}> Messenger Type: </div>
            {messengers.map(messenger => (
                <div
                    key={messenger.name}
                    className={`messengerButton ${messengerType === messenger.name ? 'active' : ''}`}
                    onClick={() => handleMessengerClick(messenger.name)}
                >
                    {messenger.label}
                </div>
            ))}
        </div>
    );
}

export default MessengerType;
