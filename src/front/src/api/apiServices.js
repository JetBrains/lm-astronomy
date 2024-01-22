const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api';
const HEADERS = {
    'accept': 'application/json'
};


export const fetchPublishers = async (publisher, id) => {
    const url = `${BASE_URL}/${publisher}/${id}/message`
    const response = await fetch(url);
    const data = await response.json();
    data.id = id;
    data.provider = publisher;
    return data;
}
function constructURL(base, params) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')

    const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
    return `${base}?${queryString}`;
}

function sortByDate(dataArray) {
    return dataArray.sort((a, b) => {
        const dateA = new Date(a.date.replace(' UT', 'Z'));
        const dateB = new Date(b.date.replace(' UT', 'Z'));
        return dateA - dateB;
    });
}
function arrayMixer(atel, gcn) {
    const mixedArray = [...atel, ...gcn];
    return sortByDate(mixedArray);
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

export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, eventType, messengerType,  page = 1) {
    const coordinatesString = (ra && dec) ? `${ra} ${dec}` : '';

    const url = constructURL( `${BASE_URL}/search/`, {
        object_name: objectName,
        object_type: physicalPhenomena,
        event_type: eventType,
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
            console.log(Object.keys(data.atel).length + Object.keys(data.gcn).length);

            const atelDataPromises = Object.values(data.atel || {}).map(item => fetchPublishers("atel", item.record_id));
            const gcnDataPromises = Object.values(data.gcn || {}).map(item => fetchPublishers("gcn", item.record_id));

            const atel = await Promise.all(atelDataPromises);
            const gcn = await Promise.all(gcnDataPromises);

            const atelMessages = mergeDataWithMessages(Object.values(data.atel || {}), atel);
            const gcnMessages = mergeDataWithMessages(Object.values(data.gcn || {}), gcn);
            return arrayMixer(atelMessages, gcnMessages);


        });
}
