import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messageIds, setMessageIds] = useState({
        atel: [],
        gcn: []
    });

    return (
        <MessageContext.Provider value={{ messageIds, setMessageIds }}>
            {children}
        </MessageContext.Provider>
    );
};
