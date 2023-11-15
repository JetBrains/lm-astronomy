import React, {useState} from 'react'
const SearchParamsContext = React.createContext();


export const SearchParamsProvider = ({ children }) => {
    const [transientName, setTransientName] = useState('');
    const [ra, setRa] = useState('');
    const [dec, setDec] = useState('');
    const [ang, setAng] = useState('');
    const [physicalPhenomena, setPhysicalPhenomena] = useState('');
    const [eventType, setEventType] = useState('');
    const [messengerType, setMessengerType] = useState('');
    const [page, setPage] = useState(1);

    const contextValue = {
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
        eventType,
        setEventType,
        messengerType,
        setMessengerType,
        page,
        setPage
    };

    return (
        <SearchParamsContext.Provider value={contextValue}>
            {children}
        </SearchParamsContext.Provider>
    );
};
export default SearchParamsContext