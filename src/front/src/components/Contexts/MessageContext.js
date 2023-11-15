import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {

    const [messagesData, setMessagesData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);

    return (
        <MessageContext.Provider value={{
            messagesData,
            setMessagesData,
            currentPage,
            setCurrentPage,
            totalPages,
            setTotalPages,
            totalMessages,
            setTotalMessages

        }}>
            {children}
        </MessageContext.Provider>
    );
};
