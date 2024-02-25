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
        date: item.createdOn, // convert to string
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
            return fetchedRecords.some(record =>
                record && record.provider === 'atel' && `ATel${nimItem.record_id}` === record.identifier
            );
        } else if (nimItem.provider === 'gcn') {
            return fetchedRecords.some(record =>
                record && record.provider === 'gcn' && `GCN${nimItem.record_id.split(".")[0]}` === record.identifier
            );
        }
        return false;
    })
        .map(nimItem => {
            const correspondingRecord = fetchedRecords.find(record =>
                (nimItem.provider === 'atel' && `ATel${nimItem.record_id}` === record.identifier) ||
                (nimItem.provider === 'gcn' && `GCN${nimItem.record_id.split(".")[0]}` === record.identifier)
            );
            return { ...nimItem, ...correspondingRecord };
        });
};




const fetchDataFromSource = async (recordId, isAtel = true) => {
    try {
        const url = isAtel
            ? `/atel/?rss+${recordId}`
            : `/gcn/${recordId.replace('neg', '-').replace('.gcn3', '')}.json`;
        const response = await fetch(url);
        if (response.status !== 200) {
            throw new Error('Failed to fetch data');
        }
        if (isAtel) {
            const responseXml = await response.text();
            const xmlDoc = new DOMParser().parseFromString(responseXml, 'text/xml');
            const result = processXmlToJson(xmlDoc);
            return result.map(record => ({ ...record, provider: 'atel' })); // Добавляем provider
        } else {
            const responseData = await response.json();
            const result = normalizeGCNData(responseData);
            return result.map(record => ({ ...record, provider: 'gcn' })); // Добавляем provider
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

