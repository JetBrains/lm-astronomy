import React, { useEffect, useState } from 'react';
import EnergyCheckbox from './EnergyCheckbox';

function EnergyRange() {

    const labelsWithDetails = {
        Radio: { color: "#333", description: "kHZ", width: "14%" },
        Micro: { color: "#333", description: "GHz", width: "14%" },
        Infrared: { color: "#333", description: "THz", width: "14%" },
        Optical: { color: "#333", description: "nm", width: "14%" },
        UV: { color: "#333", description: "eV", width: "14%" },
        "X-ray": { color: "#333", description: "KeV", width: "14%" },
        Gamma: { color: "#333", description: "MeV", width: "14%" }
    };

    const [selectedRanges, setSelectedRanges] = useState({
        Radio: false,
        Micro: false,
        Infrared: false,
        Optical: false,
        UV: false,
        "X-ray": false,
        Gamma: false
    });



    const handleCheckboxClick = (color) => {
        setSelectedRanges(prevState => ({
            ...prevState,
            [color]: !prevState[color]
        }));
    };

    useEffect(() => {
        console.log(selectedRanges);
    }, [selectedRanges]);

    return (
        <div className="energyCheckboxContainer">
            {Object.keys(labelsWithDetails).map(label => (
                <EnergyCheckbox
                    key={label}
                    color={labelsWithDetails[label].color}
                    isActive={selectedRanges[label]}
                    onClick={() => handleCheckboxClick(label)}
                    label={label}
                    description={labelsWithDetails[label].description}
                    width={labelsWithDetails[label].width}
                />
            ))}
        </div>
    );
}

export default EnergyRange;
