import React, { useState } from 'react';
import './MessengerType.css';

function MessengerType(props) {
    const messengers = [
        { label: 'γ', name: 'gamma' },
        { label: 'ν', name: 'nu' },
        { label: 'G', name: 'bigG' },
        { label: 'p', name: 'smallP' }
    ];

    const [selectedMessenger, setSelectedMessenger] = useState(null);

    const handleMessengerClick = (name) => {
        if (selectedMessenger === name) {
            setSelectedMessenger(null);
            props.onMessengerChange(null); // передаем значение в родительский компонент
        } else {
            setSelectedMessenger(name);
            props.onMessengerChange(name); // передаем значение в родительский компонент
        }
    };



    return (
        <div className="messengerContainer">
            <div className={`messengersLabel`}> Messenger Type: </div>
            {messengers.map(messenger => (
                <div
                    key={messenger.name}
                    className={`messengerButton ${selectedMessenger === messenger.name ? 'active' : ''}`}
                    onClick={() => handleMessengerClick(messenger.name)}
                >
                    {messenger.label}
                </div>
            ))}
        </div>
    );
}

export default MessengerType;