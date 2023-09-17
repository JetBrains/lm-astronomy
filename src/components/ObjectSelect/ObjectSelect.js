import React, { Component } from 'react';
import Select from 'react-select';
import './ObjectSelect.css';

const objectList = [
    "Supernova",
    "Nova",
    "Blazar",
    "cataclysmic variable",
    "black hole",
    "neutron star",
    "Quasar",
    "Agn",
    "Pulsar",
    "Binary",
    "Star",
    "Magnetar",
    "Repeater",
    "stellar object",
    "Asteroid",
    "Star",
    "bl lac object",
    "globular cluster",
    "Galaxy",
    "near-earth object",
    "System",
    "Counterpart",
    "Comet"
];

const options = objectList.map(item => ({
    value: item.toLowerCase().replace(/\s+/g, '-'), // Преобразование строки в формат "snake-case" для значения
    label: item
}));

class ObjectSelect extends Component {
    state = {
        selectedOption: null,
    };
    handleChange = (selectedOption) => {
        this.setState({ selectedOption }, () => {
            // console.log(`Option selected:`, this.state.selectedOption);
            this.props.onObjectChange(this.state.selectedOption.value); // передаем значение в родительский компонент
        });
    };


    render() {
        const { selectedOption } = this.state;

        return (
            <Select
                classNamePrefix="reactSelect"
                id="object"
                value={selectedOption}
                onChange={this.handleChange}
                options={options}
                placeholder="physical phenomena / object"
                isMulti={false}
                isSearchable={true}
            />
        );
    }
}


export default ObjectSelect;
