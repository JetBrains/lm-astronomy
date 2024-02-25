import {loadDataAndMerge} from "./loadAtelRecord";

const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api';
const HEADERS = {
    'accept': 'application/json'
};

function parseDateToTimestamp(dateStr, provider) {
    if (provider === 'atel') {
        const parts = dateStr.split(';')[0].split(' ');
        const timePart = dateStr.split(';')[1].trim();
        const timeParts = timePart.split(':');
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${timeParts[0]}:${timeParts[1]}:00Z`);
        return date.getTime();
    } else if (provider === 'gcn') {
        const parts = dateStr.split(' ')[0].split('/');
        const year = parseInt(parts[0], 10) + (parts[0].length === 2 ? 1900 : 0); // Преобразование в 4-значный год
        const date = new Date(`${year}-${parts[1]}-${parts[2]}T${dateStr.split(' ')[1]}Z`);
        return date.getTime();
    }
    return null;
}


function constructURL(base, params) {
    const filteredParams = Object.entries(params)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')

    const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
    return `${base}?${queryString}`;
}

function mergeAndSortRecords(atelArray, gcnArray) {
    atelArray = Array.isArray(atelArray) ? atelArray : Object.values(atelArray);
    gcnArray = Array.isArray(gcnArray) ? gcnArray : Object.values(gcnArray);

    const combinedRecords = [...atelArray, ...gcnArray].map(record => {
        const timestamp = parseDateToTimestamp(record.date, record.provider);
        return { ...record, timestamp };
    });

    combinedRecords.sort((a, b) => a.timestamp - b.timestamp);

    return combinedRecords;
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
            const atelData = Object.values(data.atel || {});
            const gcnData = Object.values(data.gcn || {});

            const atelDataWithProvider = atelData.map(item => ({
                ...item,
                provider: 'atel'
            }));

            const gcnDataWithProvider = gcnData.map(item => ({
                ...item,
                provider: 'gcn'
            }));
            const atelDataWithProvider1 = atelDataWithProvider.slice(0, 1);
            const nimRecords = mergeAndSortRecords(atelDataWithProvider1, gcnDataWithProvider);
            // console.log(nimRecords);
            const records = await loadDataAndMerge(nimRecords, page);
            return  {
                records: records,
                total: nimRecords.length
            }


        });
}
