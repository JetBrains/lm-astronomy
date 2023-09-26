import React, { Component } from 'react';
import Select from 'react-select';
import './TypeSelect.css';

const typeList = [
    "Neutrinos",
    "X-ray",
    "Gamma-ray",
    "Radio",
    "Optical",
    "Infra-red",
    "NIR",
    "Ultra-violet",
    "Gravitational waves"

];

const options = typeList.map(item => ({
    value: item.toLowerCase().replace(/\s+/g, '-'), // Преобразование строки в формат "snake-case" для значения
    label: item
}));

class TypeSelect extends Component {
    state = {
        selectedOption: null,
    };

    handleChange = (selectedOption) => {
        this.setState({ selectedOption }, () =>
            console.log(`Option selected:`, this.state.selectedOption)
        );
    };

    render() {
        const { selectedOption } = this.state;

        return (
            <Select
                classNamePrefix="reactSelect"
                id="type"
                value={selectedOption}
                onChange={this.handleChange}
                options={options}
                placeholder="messenger type"
                isMulti={false}
                isSearchable={true}
            />
        );
    }
}

const customStyles = {
    control: (provided) => ({
        ...provided,
        height: 40,
        backgroundColor: 'transparent',
        border: 0,
        boxShadow: 'none',
        '&:hover': {
            borderColor: 'rgba(51,51,51,1)'
        }
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'rgba(255,255,255,0.5)',
        fontSize: '40px',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 400,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'white',
        fontSize: '40px',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 400,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'rgba(51,51,51,1)',
        color: 'white'
    }),
    option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? 'rgba(211,236,39,1)' : 'white',
        backgroundColor: state.isFocused ? 'rgba(211,236,39,0.1)' : 'transparent',
        '&:hover': {
            backgroundColor: 'rgba(211,236,39,0)'
        }
    }),
    multiValue: (provided) => ({
        ...provided,
        fontSize: '40px',
        backgroundColor:'rgba(211,236,39,0.1)'

    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        display: 'none'
    }),

    Input: (provided) => ({
        ...provided,
        color: 'red'
    })
};


export default TypeSelect;
