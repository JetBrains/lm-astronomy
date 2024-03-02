import React, { useContext } from 'react';
import './MessengerType.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';
import Select from "react-select";
const messengerType = [
    'Gravitational Waves',
    'Electromagnetic Radiation',
    'Cosmic Rays',
    'Neutrinos'
];

const options = messengerType.map(item => ({
    // value: item.toLowerCase().replace(/\s+/g, '-'),
    value: item,
    label: item
}));

options.unshift({
    value: '',
    label: '------------------------x'
});

function MessengerType(props) {
    const { messengerType, setMessengerType } = useContext(SearchParamsContext);

    const handleChange = (selectedOption) => {
        setMessengerType(selectedOption ? selectedOption.value : '');

    };

    const getValue = () => {
        if (messengerType === '') return null;
        return options.find(option => option.value === messengerType);
    };


    return (
    <Select
        classNamePrefix="reactSelect"
        id="messenger"
        value={getValue()}
        onChange={handleChange}
        options={options}
        placeholder={props.placeholder}
        isMulti={false}
        isSearchable={true}
    />

    );
}

export default MessengerType;
