export function searchAPI(transientName, physicalPhenomena, messengerType) {
    // Base URL for the search API. TODO: Consider moving to an environment variable.
    const baseURL = 'https://lm-astronomy.labs.jb.gg/api/search/';

    // Headers for the request.
    const headers = {
        'accept': 'application/json'
    };

    // Convert empty inputs to null and construct the URL.
    function constructURL(base, params) {
        // Map through parameters and set to null if not provided.
        const filteredParams = Object.entries(params)
            .map(([key, value]) => [key, value || null])
            .filter(([key, value]) => value !== null);

        // Return base URL if no valid parameters are provided.
        if (!filteredParams.length) {
            return base;
        }

        // Convert parameters to a query string and replace '+' with '%20'.
        const queryString = new URLSearchParams(filteredParams).toString().replace(/\+/g, '%20');
        return `${base}?${queryString}`;
    }

    // Construct the URL with the provided parameters.
    let url = constructURL(baseURL, {
        transient_name: transientName,
        object_type: physicalPhenomena,
        messenger_type: messengerType
    });

    console.log(url);  // Debug: Log the constructed URL.

    // Make the API request.
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
