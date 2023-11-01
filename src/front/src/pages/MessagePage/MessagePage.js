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

        function extractChannelID(channelTitle = '') {
            // Убираем начальные и конечные пробелы и знаки препинания
            let trimmedTitle = channelTitle.trim().replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '');

            // Извлекаем нужную часть заголовка с использованием регулярного выражения
            let matched = trimmedTitle.match(/ATel #\d+/);

            return matched ? matched[0] : 'Unknown';
            return channelTitle;
        }

        function trimChannelIdFromTitle(title='') {
            let trimmedTitle = title.trim().replace(/^ATel \d+:\s*/, '');
            return trimmedTitle.trim();
            return title;
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






        // console.log(messagesData);

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
                                    <div className="card-id">{extractChannelID(msg.channelTitle)}</div>
                                    </div>
                                    <div className="card-title">{trimChannelIdFromTitle(msg.title)}</div>
                                </li>
                            ))}
                        </ul>
                        <h2>GCN</h2>
                        <ul>
                            {/*{messagesData.gcn && messagesData.gcn.map((msg, index) => (*/}
                            {/*    <li key={index}>{msg.title}</li>*/}
                            {/*))}*/}
                        </ul>
                        <div className="pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>&#8678;</button>
                            <span>{currentPage} из {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>&#8680;</button>
                        </div>
                    </div>
                        <div className="main">
                            {activeMessage && (
                                <>
                                    <h2 className="main-card-title">{trimChannelIdFromTitle(activeMessage.title)}</h2>
                                    <div>
                                        <strong>Object Name:</strong> {activeMessage.object_name.join(', ')}
                                    </div>
                                    <div>
                                        <strong>Event Type:</strong> {activeMessage.event_type.join(', ')}
                                    </div>
                                    <div>
                                        <strong>Messenger Type:</strong> {activeMessage.messenger_type.join(', ')}
                                    </div>
                                    <div>
                                        <strong>Object Type:</strong> {activeMessage.object_type.join(', ')}
                                    </div>
                                    <p>{activeMessage.description}</p>
                                    <p>{activeMessage.creator}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    export default MessagePage;
