import {useContext} from "react";
import loadGCNRecord from "./loadGCNRecord";
import fetchAtelRecords from "./loadAtelRecord";
import {MessageContext} from '../components/Contexts/MessageContext';




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
function mergeDataWithMessages(nimRecords, messagesArray) {
    return nimRecords.filter(nimItem =>
        messagesArray.some(msg => msg.identifier.replace(/^ATel/, "") === nimItem.record_id)
    ).map(nimItem => {
        const correspondingMessage = messagesArray.find(msg =>
            msg.identifier.replace(/^ATel/, "") === nimItem.record_id
        );
        return {
            ...nimItem,
            ...correspondingMessage,
        };
    });
}


export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, eventType, messengerType,  page) {
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
            // Return only record IDs instead of calling the useAtelRecord hook
            const nimRecords = Object.values(data.atel || {}).sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            const atelRecords = await fetchAtelRecords(nimRecords, page);
            const nimRecordsAtel = await mergeDataWithMessages(nimRecords, atelRecords.map(item => item["0"]));
            console.log(atelRecords.length);

            return  {
                records: nimRecordsAtel,
                total: nimRecords.length
            }
         //
         //  .then(async data => { })
        //     // console.log(Object.keys(data.atel).length + Object.keys(data.gcn).length);
        //
        //     const atelDataPromises = Object.values(data.atel || {}).map(item => useLoadAtelRecord(item.record_id));
        //     // const atelDataPromises = Object.values(useAtelRecord(2));
        //
            // console.log(atelDataPromises);
            // // const atelDataPromises = Object.values(data.atel || {}).map(item => fetchPublishers("atel", item.record_id));
            // // const gcnDataPromises = Object.values(data.gcn || {}).map(item => loadGCNRecord(item.record_id));
            //
            // const atel = await Promise.all(atelDataPromises);
            // // const gcn = await Promise.all(gcnDataPromises);
            //
            // const atelMessages = mergeDataWithMessages(Object.values(data.atel || {}), atel);
            // // const gcnMessages = mergeDataWithMessages(Object.values(data.gcn || {}), gcn);
            // // return arrayMixer(atelMessages, gcnMessages);
            // return atelMessages


        });
}
