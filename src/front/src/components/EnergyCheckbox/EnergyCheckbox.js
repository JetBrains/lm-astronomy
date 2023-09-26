import React from 'react';
import './EnergyCheckbox.css';


function EnergyCheckbox({ color, isActive, onClick, label, description, width }) {
    const actualColor = colorMap[label] || color;
    const styles = {
        backgroundColor: actualColor,
        width: width
    };

    return (
        <div
            className={`energyCheckbox ${isActive ? 'active' : ''}`}
            style={styles}
            onClick={onClick}
        >
            <span className="energyCheckboxLabel">{label}</span>
            <div className="energyCheckboxDescription">{description}</div>
        </div>
    );
}




const colorMap = {
    Radio: "#333",
    Micro: "#333",
    Infrared: "#333",
    Optical: "#333",
    UV: "#333",
    "X-ray": "#333",
    Gamma: "#333"
};


export default EnergyCheckbox;
