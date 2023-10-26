import React from 'react';
import { useContext } from 'react';
import { MessageContext } from '../../components/Contexts/MessageContext';
import './MessagePage.css';



function MessagePage() {
        const { messageIds } = useContext(MessageContext);

        if (!messageIds) {
            return <div>Загрузка...</div>;
        }

        return (
            <div>
                <h1>Сообщения</h1>
                <h2>ATel</h2>
                <ul>
                    {messageIds.ATel && messageIds.ATel.map(id => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
                <h2>GCN</h2>
                <ul>
                    {messageIds.GCN && messageIds.GCN.map(id => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
            </div>
        );
    }


export default MessagePage;
