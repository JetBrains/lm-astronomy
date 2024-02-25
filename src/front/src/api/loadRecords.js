const processXmlToJson = (xmlData) => {
    const result = [];
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
        result.push(itemObject);
    }
    return result;
};


function normalizeGCNData(gcnData) {
    if (!Array.isArray(gcnData)) {
        gcnData = [gcnData];
    }

    return gcnData.map(item => ({
        author: item.submitter,
        creator: item.submitter,
        creatorEmail: item.email,
        date: item.createdOn,
        description: item.body,
        identifier: `GCN${item.circularId}`,
        link: `https://gcn.nasa.gov/circulars/${item.circularId}.json`,
        title: item.subject
    }));
}

const fetchRecords = async (nimRecords, pageNumber = 1, recordsPerPage = 10) => {
    const startIndex = (pageNumber - 1) * recordsPerPage;
    const selectedNimRecords = nimRecords.slice(startIndex, startIndex + recordsPerPage);

    const atelPromises = selectedNimRecords
        .filter(item => item.provider === 'atel')
        .map(item => fetchDataFromSource(item.record_id, true));
    const gcnPromises = selectedNimRecords
        .filter(item => item.provider === 'gcn')
        .map(item => fetchDataFromSource(item.record_id, false));
    const atelRecords = await Promise.all(atelPromises);
    const gcnRecords = await Promise.all(gcnPromises);
    return [...atelRecords.flat(), ...gcnRecords.flat()];
};

const mergeDataWithRecords = (nimRecords, fetchedRecords) => {
    return nimRecords.filter(nimItem => {
        if (nimItem.provider === 'atel') {
            return fetchedRecords.some(record => record && record.provider === 'atel' && `ATel${nimItem.record_id}` === record.identifier);
        } else if (nimItem.provider === 'gcn') {
            return fetchedRecords.some(record => record && record.provider === 'gcn' && nimItem.record_id === record.identifier);
        }
        return false;
    })
        .map(nimItem => {

            const correspondingRecord = fetchedRecords.find(record => (nimItem.provider === 'atel' && `ATel${nimItem.record_id}` === record.identifier) || (nimItem.provider === 'gcn' && nimItem.record_id === record.identifier));
            return {...nimItem, ...correspondingRecord};
        });
};


const fetchDataFromSource = async (recordId, isAtel = true) => {
    try {
        const url = isAtel
            ? `https://lm-astronomy.labs.jb.gg/api/atel/${recordId}/message`
            : `https://lm-astronomy.labs.jb.gg/api/gcn/${recordId}/message`;
        const response = await fetch(url);
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        if (isAtel) {
            const responseData = await response.json();
            // const responseXml = await response.text();
            // const xmlDoc = new DOMParser().parseFromString(responseXml, 'text/xml');
            // const result = processXmlToJson(xmlDoc);
            return [responseData].map(record => ({...record, provider: 'atel'}));
        } else {
            const responseData = await response.json();
            // const result = normalizeGCNData(responseData);
            return [responseData].map(record => ({...record, identifier: recordId, provider: 'gcn'}));
        }
    } catch (error) {
        console.error('Failed to load record:', error);
        return null;
    }
};


export const loadDataAndMerge = async (nimRecords, page) => {
    const fetchedRecords = await fetchRecords(nimRecords, page);
    return mergeDataWithRecords(nimRecords, fetchedRecords);
};

