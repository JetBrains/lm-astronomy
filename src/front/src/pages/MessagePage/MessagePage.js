import React from 'react';
import { useContext } from 'react';
import { MessageContext } from '../../components/Contexts/MessageContext';
import './MessagePage.css';
import Header from "../../components/Header/Header";
import CollapsedSearchPanel from '../../components/CollapsedSearchPanel/CollapsedSearchPanel';

function MessagePage() {
    const { messageIds } = useContext(MessageContext);

    if (!messageIds) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app-container font-base">
            <div className="container">
                <Header />
                <CollapsedSearchPanel />
                <div className="subcontainer">
                    <div className="sidemenu">
                    </div>
                    <div className="main">

                    </div>
                </div>

            <h2>ATel</h2>
            <ul>
                {messageIds.atel && Object.keys(messageIds.atel).map(id => (
                    <li key={id}>{id}</li>
                ))}
            </ul>
            <h2>GCN</h2>
            <ul>
                {messageIds.gcn && Object.keys(messageIds.gcn).map(id => (
                    <li key={id}>{id}</li>
                ))}
            </ul>


            </div>
        </div>
    );
}


export default MessagePage;
