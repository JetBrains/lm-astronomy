import {loadDataAndMerge} from "./loadRecords";
import {useContext} from "react";
import SearchParamsContext from "../components/Contexts/SearchParamsContext";

const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api';
const HEADERS = {
    'accept': 'application/json'
};

function parseDateToTimestamp(dateStr, provider) {
    if(dateStr) {
        if (provider === 'atel') {
            const [datePart, timePart] = dateStr.split(';');
            const [day, month, year] = datePart.trim().split(' ');
            const [hours, minutes] = timePart.trim().split(' ')[0].split(':');

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthNumber = monthNames.indexOf(month) + 1;
            const paddedDay = day.padStart(2, '0');

            const dateISO = `${year}-${String(monthNumber).padStart(2, '0')}-${paddedDay}T${hours}:${minutes}:00Z`;
            const date = new Date(dateISO);
            return date.getTime();
        } else if (provider === 'gcn') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)) {
                const date = new Date(dateStr);
                return date.getTime();
            } else {
                const [datePart, timePart] = dateStr.split(' ');
                const [year, month, day] = datePart.split('/').map(Number);
                const correctedYear = year < 70 ? year + 2000 : year + 1900;
                const paddedMonth = String(month).padStart(2, '0');
                const paddedDay = String(day).padStart(2, '0');
                const time = timePart.split(' GMT')[0];

                const dateISO = `${correctedYear}-${paddedMonth}-${paddedDay}T${time}Z`;
                const date = new Date(dateISO);
                return date.getTime();
            }
        }
    } else {
        return null;
    }
}


function constructURL(base, params) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    const queryString =
        !Object.values(Object.values(params).every(value => value === ''|| value === 1)).every(value => value === '') ? '' :
        `?` + new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
    return `${base}${queryString}`;
}

function mergeAndSortRecords(atelArray, gcnArray) {
    atelArray = Array.isArray(atelArray) ? atelArray : Object.values(atelArray);
    gcnArray = Array.isArray(gcnArray) ? gcnArray : Object.values(gcnArray);

    const combinedRecords = [...atelArray, ...gcnArray].map(record => {
        const timestamp = parseDateToTimestamp(record.date, record.provider);
        return {...record, timestamp};
    });
    combinedRecords.sort((a, b) => b.timestamp - a.timestamp);

    return combinedRecords;
}


export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, eventType, messengerType, page) {

    const coordinatesString = (ra && dec) ? `${ra} ${dec}` : '';
    const url = constructURL(`${BASE_URL}/search/`, {
        object_name: objectName,
        object_type: physicalPhenomena,
        event_type: eventType,
        messenger_type: messengerType,
        radius: ang,
        coordinates: coordinatesString,
        page: page
    });


    return fetch(url, {headers: HEADERS})

        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            return response.json();
        })
        .then(async data => {
            const atelData = Object.values(data.atel || {});
            const gcnData = Object.values(data.gcn || {});

            const atelDataWithProvider = atelData.map(item => ({
                ...item, provider: 'atel'
            }));

            const gcnDataWithProvider = gcnData.map(item => ({
                ...item, provider: 'gcn'
            }));

            const nimRecords = mergeAndSortRecords(atelDataWithProvider, gcnDataWithProvider);
            const records = await loadDataAndMerge(nimRecords, page);
            return {
                records: records, total: nimRecords.length
            }
        });
}
