const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api';
const HEADERS = {
    'accept': 'application/json'
};


export const fetchPublishers = async (publisher, id) => {
    const url = `${BASE_URL}/${publisher}/${id}/message`
    const response = await fetch(url);
    const data = await response.json();
    data.id = id;
    data.provider = publisher
    return data;
}
function constructURL(base, params) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')

    const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
    return `${base}?${queryString}`;
}
function arrayMixer(atel, gcn) {
    const result = [];
    const targetLength = 10;

    // Рассчитываем количество элементов, которые мы возьмем из каждого массива
    let countFromAtel = Math.min(atel.length, Math.ceil(targetLength / 2));
    let countFromGcn = targetLength - countFromAtel; // Оставшееся количество добираем из gcn

    // Если элементов в gcn недостаточно, чтобы добрать до 10, берем сколько есть
    countFromGcn = Math.min(countFromGcn, gcn.length);

    // Если после этого с gcn набирается меньше 5 элементов, берем больше из atel
    if (countFromGcn < Math.ceil(targetLength / 2)) {
        countFromAtel = targetLength - countFromGcn; // Корректируем количество из atel
        countFromAtel = Math.min(countFromAtel, atel.length); // Не берем больше, чем есть
    }

    // Собираем результат из двух массивов
    for (let i = 0; i < countFromAtel; i++) {
        result.push(atel[i]);
    }
    for (let i = 0; i < countFromGcn; i++) {
        result.push(gcn[i]);
    }

    return result;
}

function formatDate(timestamp) {
    // Create a Date object from the timestamp
    const date = new Date(timestamp);

    // Adjust for UTC+2
    date.setHours(date.getHours() + 2);

    // Define month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extract the desired components
    const day = date.getUTCDate();
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    // Construct the formatted string
    return `${day} ${month} ${year}; ${hours}:${minutes} UT+2`;
}
function mergeDataWithMessages(dataArray, messagesArray) {
    return dataArray.map(dataItem => {
        // Find the corresponding message for this data item
        const correspondingMessage = messagesArray.find(msg => msg.id === dataItem.record_id);

        // If a corresponding message is found, merge the properties, else just return the data item
        if (correspondingMessage) {
            return {
                ...dataItem,              // properties from the atelData/gcnData
                ...correspondingMessage,  // properties from the fetched message
            };
        } else {
            return dataItem;  // if no corresponding message was found, just return the data item
        }
    });
}

export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, messengerType, eventType, page = 1) {
    const ITEMS_PER_PAGE = 10;
    const coordinatesString = (ra && dec) ? `${ra} ${dec}` : '';

    const url = constructURL( `${BASE_URL}/search/`, {
        object_name: objectName,
        object_type: physicalPhenomena,
        messenger_type: messengerType,
        radius: ang,
        coordinates: coordinatesString,
        page: page
    });
    console.log(url)

    return fetch(url, { headers: HEADERS })

        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(async data => {
            console.log(data);
            console.log(Object.keys(data.atel).length + Object.keys(data.gcn).length);

            const startIdx = (page - 1) * ITEMS_PER_PAGE;
            const endIdx = startIdx + ITEMS_PER_PAGE;

            const atelData = Object.values(data.atel || {}).slice(startIdx, endIdx);
            const gcnData = Object.values(data.gcn || {}).slice(startIdx, endIdx);

            const atelDataPromises = atelData.flat().map(item => fetchPublishers("atel",item.record_id));
            const gcnDataPromises = gcnData.flat().map(item => fetchPublishers("gcn", item.record_id));

            const atel = (await Promise.all(atelDataPromises));
            const gcn = (await Promise.all(gcnDataPromises));

            const atelMessages = mergeDataWithMessages(atelData.flat(), atel);
            const gcnMessages = mergeDataWithMessages(gcnData.flat(), gcn);
            console.log(atelMessages);
            // console.log(arrayMixer(atelMessages, gcnMessages));
            return arrayMixer(atelMessages, gcnMessages);


        });
}
