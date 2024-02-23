const loadGCNRecord = async (recordId) => {
    recordId = recordId.replace('neg', '-').replace('.gcn3', '');
    const url = `https://gcn.nasa.gov/circulars/${recordId}.json`;

    try {
        const response = await fetch(url);
        if (response.status !== 200) {
            return null;
        }

        const responseData = await response.json();
        return {
            author: responseData.submitter,
            link: url,
            title: responseData.subject,
            date: new Date(responseData.createdOn * 1000),
            description: responseData.body,
        };
    } catch (error) {
        console.error('Error loading GCN record:', error);
        return null;
    }
};

export default loadGCNRecord;
