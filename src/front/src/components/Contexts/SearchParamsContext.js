import React, { createContext, useState } from 'react';
import CoordinatesContext from "./CoordinatesContext";

const SearchParamsContext = createContext({
    transientName: '',
    setTransientName: () => {},
    ra: '',
    setRa: () => {},
    dec: '',
    setDec: () => {},
    ang: '',
    setAng: () => {},
    physicalPhenomena: '',
    setPhysicalPhenomena: () => {},
    messengerType: '',
    setMessengerType: () => {},
    page: 1,
    setPage: () => {},
});

const SearchParamsProvider = ({ children }) => {
    // Определение индивидуальных хуков состояния для каждого параметра поиска
    const [transientName, setTransientName] = useState('');
    const [ra, setRa] = useState('');
    const [dec, setDec] = useState('');
    const [ang, setAng] = useState('');
    const [physicalPhenomena, setPhysicalPhenomena] = useState('');
    const [messengerType, setMessengerType] = useState('');
    const [page, setPage] = useState(1);

    return (
        <SearchParamsContext.Provider value={{
            transientName,
            setTransientName,
            ra,
            setRa,
            dec,
            setDec,
            ang,
            setAng,
            physicalPhenomena,
            setPhysicalPhenomena,
            messengerType,
            setMessengerType,
            page,
            setPage
        }}>
            {children}
        </SearchParamsContext.Provider>
    );
};

export default CoordinatesContext;