import { parseAndCleanCoordinates } from '../components/parseCoordinatesUtility.js';

export function searchAPI(transientName, physicalPhenomena, messengerType) {
    const baseURL = 'https://lm-astronomy.labs.jb.gg/api/search/';
    const headers = {
        'accept': 'application/json'
    };

    const coordinates = parseAndCleanCoordinates(transientName);

    function constructURL(base, params) {
        let coordinatesString = '';
        if (params.ra !== null && params.dec !== null) {
            coordinatesString = `${params.ra} ${params.dec}`;
        }
        if (params.transient_name) {
            coordinatesString = `${coordinatesString} ${params.transient_name}`.trim();
        }

        // Replace the old parameters with the new format
        delete params.ra;
        delete params.dec;
        delete params.transient_name;
        params.object_name_or_coordinates = coordinatesString;

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
        transient_name: coordinates.text,
        object_type: physicalPhenomena,
        messenger_type: messengerType,
        radius: coordinates.ang,
        ra: coordinates.ra,
        dec: coordinates.dec
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
        .then(data => {
            console.log(data);  // Debug: Log the received data.
            return data;
        });
}
