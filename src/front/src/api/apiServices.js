// apiServices.js

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
            // console.log(arrayMixer(atelMessages, gcnMessages));
            return arrayMixer(atelMessages, gcnMessages);


        });
}


// const c = {
//     "author": "P. Balanutsa, V. Lipunov, D. Buckley, E. Gorbovskoy, V. Kornilov, N. Tiurina, A. Kuznetsov, D. Vlasenko, V. Vladimirov, D. Zimnukhov, A. Chasovnikov, N. Budnev, O. Gress, R. Rebolo Lopez, M. Serra-Ricart, R. Podesta, F. Podesta, C. Lopez, C. Francile, H. Levato, V. Senik, A. Tlatov, D. Dormidontov, A. Gabovich, V. Yurkov, D. Kobtsev, Y. Sergienko, T. Pogrosheva, V. Shumkov",
//     "link": "https://www.astronomerstelegram.org/?read=12345",
//     "title": "ATel 12345: MASTER PSN detection in UGC03660",
//     "creator": "P. Balanutsa, V. Lipunov, D. Buckley, E. Gorbovskoy, V. Kornilov, N. Tiurina, A. Kuznetsov, D. Vlasenko, V. Vladimirov, D. Zimnukhov, A. Chasovnikov, N. Budnev, O. Gress, R. Rebolo Lopez, M. Serra-Ricart, R. Podesta, F. Podesta, C. Lopez, C. Francile, H. Levato, V. Senik, A. Tlatov, D. Dormidontov, A. Gabovich, V. Yurkov, D. Kobtsev, Y. Sergienko, T. Pogrosheva, V. Shumkov",
//     "date": "2018-12-31T17:06:40+00:00",
//     "description": "MASTER OT J070634.76+635056.9 discovery - PSN in UGC03660    MASTER-Kislovodsk auto-detection system discovered OT source at (RA, Dec) = 07h 06m 34.76s +63d 50m 56.9s on 2017-12-30.7916 UT. ...",
//     "creatoremail": "tiurina2009@gmail.com",
//     "identifier": "ATel12345",
//     "provenance": "Credentialed by: Nataly Tyurina (tiurina@sai.msu.ru)",
//     "publisher": "The Astronomer's Telegram"
// }
//
// const b = {
//     "author": "Frank Marshall at GSFC  <marshall@khamseen.gsfc.nasa.gov>",
//     "link": "https://gcn.nasa.gov/circulars/138.json",
//     "title": "RXTE Observation of GRB 980706",
//     "date": "1998-07-08T03:51:42",
//     "description": "F. E. Marshall (NASA/GSFC) and T. Takeshima (USRA/GSFC),\non behalf of the RXTE team, and P. Woods (UAH/MSFC) on\nbehalf of the BATSE team, report the detection\nof an X-ray source during scans of the Locburst error region for\nGRB 980706 (BATSE trigger 6904) with the PCA on RXTE.\nA 4x8 degree region centered\non RA=161.82 and DEC=57.52 was scanned during a 2-hour\ninterval starting July 6.781, which is 2.7 hours after the burst.\nA 90% confidence error region for the source has corners at\n(RA, DEC) of (165.586, 57.801), (164.897, 55.836),\n(164.366, 55.890), and (164.993, 57.860).\nSince this error box intersects the preliminary IPN annulus\n(GCN Circ. 129), the X-ray source may be the\nafterglow of the GRB. If so, the afterglow had a flux \nof about 2 mCrab in the 2-10 keV band 2.9 hours after the burst.\nThe intersection of the error box and the preliminary IPN annulus\nis centered at (165.137, 57.385),and has a width of about 0.6 deg.\nin RA and 0.026 deg. in DEC. However, the X-ray source\nwas not detected during two subsequent scans 1.5 hours later\nindicating either unusual variability (a decay index of\nat least 3 for an assumed power-law decay) or that the X-ray source\nis not located in the intersection of the error box and the annulus.\nThe ROSAT-survey source J105825.9+564716, which lies\njust outside the X-ray error box, is\nan alternative identification of the X-ray source.\nIn this case, the X-ray source is unrelated to the GRB."
// }
