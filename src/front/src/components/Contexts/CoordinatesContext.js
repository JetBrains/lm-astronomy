import React from 'react';

const CoordinatesContext = React.createContext({
    coordinates: null,
    setCoordinates: () => {},
    transient: "",
    setTransient: () => {},
    selectedMessenger: null,
    setSelectedMessenger: () => {},
    selectedObject: null,
    setSelectedObject: () => {}
});


export default CoordinatesContext;
