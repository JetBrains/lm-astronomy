import React, { useContext, useState, useEffect } from 'react';
import Select from 'react-select';
import './ObjectSelect.css';
import CoordinatesContext from '../../components/Contexts/CoordinatesContext';

const objectList = [
    '',
    'Accreting Object',
    'Active Galactic Nuclei',
    'Black Hole',
    'Neutron Star',
    'Nova',
    'Supernova',
    'Star & Stellar System',
    'Variable Star',
    'Exoplanet',
    'Stellar Evolution Stage',
    'Minor Body',
    'Binary System',
    'Pulsar',
    'Interstellar Medium',
    'Galaxy',
    'Quasar',
    'Globular Cluster',
    'Near-earth object',
    'Magnetar',
    'Repeater',
    'Circumstellar Disk',
    'Electromagnetic Source'
];

const options = objectList.map(item => ({
    // value: item.toLowerCase().replace(/\s+/g, '-'),
    value: item,
    label: item
}));
function ObjectSelect(props) {
    const { selectedObject, setSelectedObject } = useContext(CoordinatesContext);
    const [selectedOption, setSelectedOption] = useState(() => options.find(opt => opt.value === selectedObject));

    const handleChange = (option) => {
        setSelectedOption(option);
        setSelectedObject(option.value);
        props.onObjectChange(option.value);
    };

    // Этот useEffect обновляет selectedOption, если selectedObject в контексте меняется
    useEffect(() => {
        setSelectedOption(options.find(opt => opt.value === selectedObject));
    }, [selectedObject]);

    return (
        <Select
            classNamePrefix="reactSelect"
            id="object"
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="physical phenomena / object"
            isMulti={false}
            isSearchable={true}
        />
    );
}

export default ObjectSelect;