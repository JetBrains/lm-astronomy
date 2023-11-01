// apiServices.js

const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api/search/';
const HEADERS = {
    'accept': 'application/json'
};


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
        creator: item.getElementsByTagName('creator')[0].textContent,
        provider: "atel"
    }));

    return messages;
}



export const fetchGCNMessage = async (id) => {
    const url = `/gcn/${id}.json`;
    const response = await fetch(url);
    const data = await response.json();
    const messages = [{
        id: data.circularId,
        channelTitle: "GCN #" + data.circularId,
        channelDescription: "GCN Circulars: GCN #" + data.circularId,
        channelLink: "https://gcn.nasa.gov/circulars/",
        title: data.subject,
        description: data.body,
        date: formatDate(data.createdOn),
        link: "",
        creator: data.submitter,
        provider: "gcn"
    }];

    return messages;

}

function constructURL(base, params) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined);

    const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
    return `${base}?${queryString}`;
}
function arrayMixer(atel, gcn) {
    // Determine the minimum length of the two arrays
    const minLength = Math.min(atel.length, gcn.length);

    // Slice both arrays up to the minimum length
    const slicedAtel = atel.slice(0, minLength);
    const slicedGcn = gcn.slice(0, minLength);

    // Combine the sliced arrays
    return [...slicedAtel, ...slicedGcn];
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

export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, messengerType, setMessagesData, page = 1) {
    const ITEMS_PER_PAGE = 10;
    const coordinatesString = (ra && dec) ? `${ra} ${dec}` : '';

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

            const atelData = Object.values(data.atel || {}).slice(startIdx, endIdx);
            const gcnData = Object.values(data.gcn || {}).slice(startIdx, endIdx);

            const atelDataPromises = atelData.flat().map(item => fetchAtelMessage(item.record_id));
            const gcnDataPromises = gcnData.flat().map(item => fetchGCNMessage(item.record_id));

            const atel = (await Promise.all(atelDataPromises)).flat();
            const gcn = (await Promise.all(gcnDataPromises)).flat();

            const atelMessages = mergeDataWithMessages(atelData.flat(), atel);
            const gcnMessages = mergeDataWithMessages(gcnData.flat(), gcn);
            console.log(arrayMixer(atelMessages, gcnMessages));
            return arrayMixer(atelMessages, gcnMessages);
        });
}
