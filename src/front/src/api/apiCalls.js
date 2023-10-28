import { fetchAtelMessage, fetchGCNMessage } from '../components/fetchesFromAtelGCN';
import { useContext } from 'react';
import { MessageContext } from '../components/Contexts/MessageContext';

export function searchAPI(objectName, ra, dec, ang, physicalPhenomena, messengerType, setMessageIds) {
    const baseURL = 'https://lm-astronomy.labs.jb.gg/api/search/';
    const headers = {
        'accept': 'application/json'
    };

    const coordinatesString = (ra !== null && dec !== null) ? `${ra} ${dec}` : ''; // Изменен этот момент

    function constructURL(base, params) {
        // Map through parameters and set to null if not provided
        const filteredParams = Object.entries(params)
            .map(([key, value]) => [key, value || null])
            .filter(([key, value]) => value !== null);

        // Return base URL if no valid parameters are provided
        if (!filteredParams.length) {
            return base;
        }

        // Convert parameters to a query string and replace '+' with '%20'
        const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
        return `${base}?${queryString}`;
    }

    let url = constructURL(baseURL, {
        object_name: objectName,
        object_type: physicalPhenomena,
        messenger_type: messengerType,
        radius: ang,
        coordinates: coordinatesString
    });

    console.log(url);  // Debug: Log the constructed URL.

    // Make the API request
    return fetch(url, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(async data => {
            console.log(data);  // Debug: Log the received data.

            const atelDataPromises = Object.keys(data.atel || {}).map(id => fetchAtelMessage(id));
            const gcnDataPromises = Object.keys(data.gcn || {}).map(id => fetchGCNMessage(id));


            const atelMessages = await Promise.all(atelDataPromises);
            const gcnMessages = await Promise.all(gcnDataPromises);

            const result = {
                atel: atelMessages,
                gcn: gcnMessages
            };

            // Обновите контекст с новыми данными
            setMessageIds(result);

            return result;
        });
}
