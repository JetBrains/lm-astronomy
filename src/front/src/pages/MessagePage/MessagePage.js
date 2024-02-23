import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {MessageContext} from '../../components/Contexts/MessageContext';
import './MessagePage.css';
import Header from "../../components/Header/Header";
import CollapsedSearchPanel from '../../components/CollapsedSearchPanel/CollapsedSearchPanel';
import SearchParamsContext from '../../components/Contexts/SearchParamsContext';
import {searchAPI} from "../../api/apiServices";

function MessagePage() {
    const {
        transientName,
        ra,
        dec,
        ang,
        eventType,
        physicalObject,
        messengerType,
    } = useContext(SearchParamsContext);

    const navigate = useNavigate();

    useEffect(() => {
        if (!transientName && !ra && !dec && !ang && !eventType && !physicalObject && !messengerType) {
            navigate('/');
        }
    }, [transientName, ra, dec, ang, eventType, physicalObject, messengerType, navigate]);


    const {
        setMessagesData,
        messagesData,
        currentPage,
        setCurrentPage,
        totalMessages,
    } = useContext(MessageContext);



    const [activeMessageId, setActiveMessageId] = useState(
        messagesData && messagesData.length > 0 ? messagesData[0].record_id : null
    );

    const [loadedMessages, setLoadedMessages] = useState([]);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoadedMessages(messagesData);
    }, [messagesData]);

    const loadMoreData = async () => {
        setIsLoading(true);
        const newPage = currentPage + 1;
        const newData = await searchAPI(transientName, ra, dec, ang, physicalObject, eventType, messengerType, newPage);


        setMessagesData([...messagesData, ...newData.records]);
        setCurrentPage(newPage);
        setIsLoading(false);
    };
    const [isLoading, setIsLoading] = useState(false);


    const handleShowMore = () => {
        loadMoreData();
    };
    useEffect(() => {
        const mainElement = document.querySelector('.main');
        const offsetTop = mainElement.offsetTop;

        const onScroll = () => {
            if (window.scrollY > offsetTop) {
                mainElement.classList.add('fixed');
            } else {
                mainElement.classList.remove('fixed');
            }
        };

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);


    const activeMessage = messagesData && messagesData.find(msg => msg.record_id === activeMessageId);


    const handleCardClick = (id) => {
        setActiveMessageId(id);
        // Здесь можно вызывать функцию для перезагрузки контента в main колонке, когда она будет готова
    };

    function trimChannelIdFromTitle(title = '') {
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
    const processDescription = (description) => {
        const trimmedDescription = description.endsWith('...') ? description.slice(0, -3) : description;

        // Возвращаем JSX с обработанным описанием и ссылкой
        return (
            <>
                   {trimmedDescription}
                    <a href={activeMessage.link} target="_blank" rel="noopener noreferrer">
                        More...
                    </a>
            </>
        );
    };
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
            if (activeMessage.coordinate_system && activeMessage.coordinates) {
                addItem(`${activeMessage.coordinate_system}: ${activeMessage.coordinates}`);
            }
        }

        return listItems;
    }

    function ActiveMessageTagList({activeMessage}) {
        // Проверка, что activeMessage не undefined или null
        if (!activeMessage) {
            return null;
        }

        const listItems = generateTagList(activeMessage);
        return (
            <ul className={"tagList"}>
                {listItems.length > 0 ? listItems : <li>No data available</li>}
            </ul>
        );
    }



    if (!messagesData) {
        return <div>Loading...</div>;
    }

    const searchString = [
        transientName && `${transientName}`,
        ra && `RA=${ra}`,
        dec && `DEC=${dec}`,
        ang && `ANG=${ang}`,
        physicalObject && `${physicalObject}`,
        eventType && `${eventType}`,
        messengerType && `${messengerType}`
    ].filter(Boolean).join(', ');





    return (
        <div className="app-container font-base">
            <div className="container">
                <Header/>
                <CollapsedSearchPanel searched={searchString} total={totalMessages}/>
                <div className="columns">

                    <div className="sidemenu">
                        <ul className="cards-list">
                            {loadedMessages && loadedMessages.map((msg) => (
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
                        {loadedMessages.length < totalMessages && (
                            <button onClick={handleShowMore} disabled={isLoading}>
                                {isLoading ? 'Loading...' : `Show more ( ${totalMessages - loadedMessages.length} )`}
                            </button>

                        )}
                    </div>

                    <div className="main">
                        {activeMessage ? (
                            <>
                            <ActiveMessageTagList activeMessage={activeMessage}/>
                                <div className="main-card-header">
                                    <div className="main-card-date">{formatDate(activeMessage.date)}</div>
                                    <div className="main-card-id">
                                        {activeMessage.provider === "atel" ? `ATel${activeMessage.record_id}` : null}
                                        {activeMessage.provider === "gcn" ? `GCN${activeMessage.record_id.split('.')[0]}` : null}
                                    </div>

                                </div>
                                <h2 className="main-card-title">{trimChannelIdFromTitle(activeMessage.title)}</h2>
                                <p className={"main-card-message"}>{processDescription(activeMessage.description)}</p>
                                <p className={"main-card-creator"}>{activeMessage.creator}</p>
                            </>
                        ) : (
                            <p>No messages</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagePage;
