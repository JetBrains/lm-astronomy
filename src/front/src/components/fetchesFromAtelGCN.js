export const fetchAtelMessage = async (id) => {
    const url = `https://www.astronomerstelegram.org/?rss+${id}`;
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    // Извлечение необходимых данных из XML
    const title = xmlDoc.getElementsByTagName('title')[1].childNodes[0].nodeValue;
    const description = xmlDoc.getElementsByTagName('description')[1].childNodes[0].nodeValue;
    const date = xmlDoc.getElementsByTagName('dc:date')[0].childNodes[0].nodeValue;
    return { title, description, date };
}

export const fetchGCNMessage = async (id) => {
    const url = `https://gcn.nasa.gov/circulars/${id}.json`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
