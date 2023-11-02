import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messagesData, setMessagesData] = useState([]);
    // console.log(messagesData);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    return (
        <MessageContext.Provider value={{
            messagesData,
            setMessagesData,
            currentPage,
            setCurrentPage,
            totalPages,
            setTotalPages,
        }}>
            {children}
        </MessageContext.Provider>
    );
};
