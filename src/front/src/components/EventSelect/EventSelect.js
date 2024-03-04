import React, {useContext, useState, useEffect} from 'react';
import Select from 'react-select';
import './EventSelect.css';
import SearchParamsContext from '../../components/Contexts/SearchParamsContext';

const eventList = [
    'High Energy Event',
    'Gamma-Ray Burst',
    'Tidal Disruption Event',
    'Low Energy Event',
    'Solar Event',
    'Microlensing Event',
    'Pulsation',
    'Fast Radio Burst',
    'Activity Episode',
    'Flare',
    'Transient',
    'Outburst',
    'Accretion',
    'Afterglow',
    'Brightening',
    'Variability',
    'Dimming and Decline',
    'Dipping and Eclipsing',
    'Emission',
    'Absorption',
    'Core Collapse',
    'State Transition',
    'Glitch',
    'Eruption',

];

const options = eventList.map(item => ({
    // value: item.toLowerCase().replace(/\s+/g, '-'),
    value: item,
    label: item
}));
options.unshift({
    value: '',
    label: 'x'
});

function EventSelect(props) {
    const {eventType, setEventType} = useContext(SearchParamsContext);

    const handleChange = (selectedOption) => {
        setEventType(selectedOption ? selectedOption.value : '');
    };

    const getValue = () => {
        if (eventType === '') return null;
        return options.find(option => option.value === eventType);
    };

    return (
        <Select
            classNamePrefix="reactSelect"
            id="event"
            value={getValue()}
            onChange={handleChange}
            options={options}
            placeholder={props.placeholder}
            isMulti={false}
            isSearchable={true}
        />
    );
}

export default EventSelect;