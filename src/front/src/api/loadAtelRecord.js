const processXmlToJson = (xmlData) => {
    let result = {};
    const items = xmlData.getElementsByTagName('item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const keys = item.children;
        let itemObject = {};
        for (let j = 0; j < keys.length; j++) {
            let key = keys[j].tagName;
            let value = keys[j].textContent || keys[j].innerText;
            itemObject[key] = value;
        }
        result[i] = itemObject;
    }
    return result;
};
const fetchAtelRecords = async (nimRecords, pageNumber = 1, recordsPerPage = 10) => {
    const startIndex = (pageNumber - 1) * recordsPerPage;
    const selectedNimRecords = nimRecords.slice(startIndex, startIndex + recordsPerPage);

    const recordPromises = selectedNimRecords.map(item => fetchAtelRecord(item.record_id));
    return await Promise.all(recordPromises);
};

const fetchAtelRecord = async (id) => {
    if (!id || typeof id == 'object') {
        console.error('Invalid id:', id);
        return null;
    }
    try {
        const url = `/atel/?rss+${id}`;
        const response = await fetch(url);
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        const responseXml = await response.text();
        const xmlDoc = new DOMParser().parseFromString(responseXml, 'text/xml');
        const jsonData = processXmlToJson(xmlDoc);
        return jsonData;
    } catch (error) {
        console.error('Failed to load ATel record:', error);
        return null; // Or handle the error as needed
    }
};


export default fetchAtelRecords;
