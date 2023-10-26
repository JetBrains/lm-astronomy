import React, { useContext } from 'react';
import './MessengerType.css';
import CoordinatesContext from '../../components/Contexts/CoordinatesContext';

function MessengerType(props) {
    const { selectedMessenger, setSelectedMessenger } = useContext(CoordinatesContext);

    const handleMessengerClick = (name) => {
        if (selectedMessenger === name) {
            setSelectedMessenger(null);
            props.onMessengerChange(null);
        } else {
            setSelectedMessenger(name);
            props.onMessengerChange(name); // передаем значение в родительский компонент
        }
    };

    const messengers = [
        { label: 'ν', name: 'Electromagnetic Radiation' },
        { label: 'G', name: 'Gravitational Waves' },
        { label: 'p', name: 'Neutrinos' },
        { label: 'γ', name: 'Cosmic Rays' },
    ];





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
