// apiServices.js

// Настройки запросов
const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api/search/';
const HEADERS = {
    'accept': 'application/json'
};

// Функция для запроса сообщений Atel
export const fetchAtelMessage = async (id) => {
    const url = `/atel/?rss+${id}`;
    const response = await fetch(url);
    const text = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const channel = xmlDoc.getElementsByTagName('channel')[0];
    const items = xmlDoc.getElementsByTagName('item'); // получаем все элементы 'item'


    if (!channel || !items) {
        throw new Error("XML does not contain expected elements.");
    }

    const messages = Array.from(items).map(item => ({
        id : id,
        channelTitle: channel.getElementsByTagName('title')[0].textContent,
        channelDescription: channel.getElementsByTagName('description')[0].textContent,
        channelLink: channel.getElementsByTagName('link')[0].textContent,
        title: item.getElementsByTagName('title')[0].textContent,
        description: item.getElementsByTagName('description')[0].textContent,
        date: item.getElementsByTagName('dc:date')[0].textContent,
        link: item.getElementsByTagName('link')[0].textContent,
        creator: item.getElementsByTagName('creator')[0].textContent
    }));

    return messages;
}


// Функция для запроса сообщений GCN
export const fetchGCNMessage = async (id) => {
    const url = `/gcn/${id}.json`;
    const response = await fetch(url);
    return response.json();
}

// Функция поиска через API
export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, messengerType, setMessagesData, page = 1) {
    const ITEMS_PER_PAGE = 10;
    const coordinatesString = (ra && dec) ? `${ra} ${dec}` : '';

    function constructURL(base, params) {
        const filteredParams = Object.entries(params)
            .filter(([key, value]) => value !== null && value !== undefined);

        const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
        return `${base}?${queryString}`;
    }

    const url = constructURL(BASE_URL, {
        object_name: objectName,
        object_type: physicalPhenomena,
        messenger_type: messengerType,
        radius: ang,
        coordinates: coordinatesString,
        page: page
    });

    return fetch(url, { headers: HEADERS })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(async data => {
            const startIdx = (page - 1) * ITEMS_PER_PAGE;
            const endIdx = startIdx + ITEMS_PER_PAGE;

            const atelIds = Object.keys(data.atel || {}).slice(startIdx, endIdx);
            const gcnIds = Object.keys(data.gcn || {}).slice(startIdx, endIdx);

            const atelDataPromises = atelIds.map(id => fetchAtelMessage(id));
            const gcnDataPromises = gcnIds.map(id => fetchGCNMessage(id));

            const atelMessages = (await Promise.all(atelDataPromises)).flat();
            const gcnMessages = (await Promise.all(gcnDataPromises)).flat();
            console.log(atelMessages);


            const result = {
                atel: atelMessages,
                gcn: gcnMessages
            };
            // setMessagesData(result);
            return result;
        });
}
