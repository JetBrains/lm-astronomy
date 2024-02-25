import {loadDataAndMerge} from "./loadAtelRecord";

const BASE_URL = 'https://lm-astronomy.labs.jb.gg/api';
const HEADERS = {
    'accept': 'application/json'
};

function parseDateToTimestamp(dateStr, provider) {
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
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('/').map(Number);
        const correctedYear = year < 70 ? year + 2000 : year + 1900; // предполагаем, что года 00-69 соответствуют 2000-2069, а 70-99 - 1970-1999
        const paddedMonth = String(month).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        const time = timePart.split(' GMT')[0]; // удаляем " GMT" из строки времени

        const dateISO = `${correctedYear}-${paddedMonth}-${paddedDay}T${time}Z`; // Заменяем GMT на Z, так как GMT эквивалентно UTC
        const date = new Date(dateISO);
        console.log(date.getTime());
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
    combinedRecords.sort((a, b) => b.timestamp - a.timestamp);

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
            // const atelDataWithProvider1 = atelDataWithProvider.slice(0, 1);
            const nimRecords = mergeAndSortRecords(atelDataWithProvider, gcnDataWithProvider);
            // console.log(nimRecords);
            const records = await loadDataAndMerge(nimRecords, page);
            return  {
                records: records,
                total: nimRecords.length
            }


        });
}
