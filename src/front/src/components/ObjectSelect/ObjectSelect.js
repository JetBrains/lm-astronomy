import React, { Component } from 'react';
import Select from 'react-select';
import './ObjectSelect.css';

const objectList = [
      "Accreting Object",
      "Active Galactic Nuclei",
      "Black Hole",
      "Neutron Star",
      "Nova",
      "Supernova",
      "Star & Stellar System",
      "Variable Star",
      "Exoplanet",
      "Stellar Evolution Stage",
      "Minor Body",
      "Binary System",
      "Pulsar",
      "Interstellar Medium",
      "Galaxy",
      "Quasar",
      "Globular Cluster",
      "Near-earth object",
      "Magnetar",
      "Repeater",
      "Circumstellar Disk",
      "Electromagnetic Source"
];

const options = objectList.map(item => ({
    value: item,
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
