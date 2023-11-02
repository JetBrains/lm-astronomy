    import React, {useContext, useEffect, useState} from 'react';
    // import { useNavigate } from 'react-router-dom';
    import { MessageContext } from '../../components/Contexts/MessageContext';
    import './MessagePage.css';
    import Header from "../../components/Header/Header";
    import CollapsedSearchPanel from '../../components/CollapsedSearchPanel/CollapsedSearchPanel';

    function MessagePage() {
        const { messagesData, currentPage, setCurrentPage, totalPages } = useContext(MessageContext);
        const [activeMessageId, setActiveMessageId] = useState(
            messagesData && messagesData.length > 0 ? messagesData[0].record_id : null
        );
        const activeMessage = messagesData && messagesData.find(msg => msg.record_id === activeMessageId);
        const handleCardClick = (id) => {
            setActiveMessageId(id);
            // Здесь можно вызывать функцию для перезагрузки контента в main колонке, когда она будет готова
        };
        function trimChannelIdFromTitle(title='') {
            let trimmedTitle = title.trim().replace(/^ATel \d+:\s*/, '');
            return trimmedTitle.trim();
        }
        function formatDate(inputDate) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const date = new Date(inputDate);

            const day = date.getUTCDate();
            const month = months[date.getUTCMonth()];
            const year = date.getUTCFullYear();
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');

            // Получаем смещение времени в минутах
            const offset = date.getTimezoneOffset();
            // Преобразуем смещение в формат ±hh:mm
            const offsetSign = offset > 0 ? '-' : '+';
            const offsetHours = Math.floor(Math.abs(offset) / 60);
            const offsetMinutes = Math.abs(offset) % 60;

            let timeLabel;
            if (offset === 0) {
                timeLabel = 'UT';
            } else if (offsetMinutes === 0) {
                timeLabel = `UT${offsetSign}${offsetHours}`;
            } else {
                timeLabel = `UT${offsetSign}${offsetHours}:${offsetMinutes}`;
            }

            return `${day} ${month} ${year}; ${hours}:${minutes} ${timeLabel}`;
        }
        function generateTagList(activeMessage) {
            // Пустой массив для хранения элементов li
            const listItems = [];


            const addItem = (item) => {
                if (Array.isArray(item) && item.length > 0) {
                    item.forEach(value => {
                        const trimmedValue = value.trim();
                        if (trimmedValue) {
                            listItems.push(<li key={value}>{value}</li>);
                        }
                    });
                } else if (typeof item === 'string' && item.trim()) {
                    listItems.push(<li key={item}>{item}</li>);
                }
            };



            if (activeMessage) {
                addItem(activeMessage.object_name);
                addItem(activeMessage.messenger_type);
                addItem(activeMessage.object_type);
                addItem(activeMessage.event_type);
            }

            return listItems;
        }

        function ActiveMessageTagList({ activeMessage }) {
            // Проверка, что activeMessage не undefined или null
            if (!activeMessage) {
                return null;
            }

            const listItems = generateTagList(activeMessage);
            return (
                <ul>
                    {listItems.length > 0 ? listItems : <li>No data available</li>}
                </ul>
            );
        }


        if (!messagesData) {
            return <div>Loading...</div>;
        }

        return (
            <div className="app-container font-base">
                <div className="container">
                    <Header />
                    <CollapsedSearchPanel />
                        <div className="columns">
                        <div className="sidemenu">
                            <ul className="cards-list">
                                {messagesData && messagesData.map((msg) => (
                                    <li
                                        key={msg.record_id}
                                        className={`card-item ${msg.record_id === activeMessageId ? 'active-card' : ''}`}
                                        onClick={() => handleCardClick(msg.record_id)}
                                    >
                                        <div className="card-header">
                                        <div className="card-date">{formatDate(msg.date)}</div>
                                            <div className="card-id">
                                                {msg.provider === "atel" ? `ATel${msg.record_id}` : null}
                                                {msg.provider === "gcn" ? `GCN${msg.record_id.split('.')[0]}` : null}
                                            </div>

                                        </div>
                                        <div className="card-title">{trimChannelIdFromTitle(msg.title)}</div>
                                    </li>
                                ))}
                            </ul>
                            <div className="pagination">
                                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>&#8678;</button>
                                <span>{currentPage} из {totalPages}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>&#8680;</button>
                            </div>
                        </div>
                        <div className="main">
                                {activeMessage ? (
                                    <>
                                        <ActiveMessageTagList activeMessage={activeMessage} />

                                        <h2 className="main-card-title">{trimChannelIdFromTitle(activeMessage.title)}</h2>
                                        <p>{activeMessage.description}</p>
                                        <p>{activeMessage.creator}</p>
                                    </>
                                 ) : (
                                    <p>No message selected</p>
                                    )}
                            </div>
                    </div>
                </div>
            </div>
        );
    }

    export default MessagePage;
