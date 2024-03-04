import React, { useContext } from 'react';
import Select from 'react-select';
import './PhysicalObjectSelect.css';
import SearchParamsContext from '../Contexts/SearchParamsContext';

const objectList = [
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
options.unshift({
    value: '',
    label: 'x'
});
function PhysicalObjectSelect(props) {
    const { physicalObject, setPhysicalObject } = useContext(SearchParamsContext);

    const handleChange = (selectedOption) => {
        setPhysicalObject(selectedOption ? selectedOption.value : '');
    };

    const getValue = () => {
        if (physicalObject === '') return null;
        return options.find(option => option.value === physicalObject);
    };

    return (
        <Select
            classNamePrefix="reactSelect"
            id="object"
            value={getValue()}
            onChange={handleChange}
            options={options}
            placeholder= {props.placeholder}
            isMulti={false}
            isSearchable={true}
        />
    );
}

export default PhysicalObjectSelect;