export function searchAPI(transientName, physicalPhenomena, messengerType) {
    // Определите базовый URL и заголовки
    const baseURL = 'https://lm-astronomy.labs.jb.gg/api/search/'; // TODO: move to .env
    const headers = {
        'accept': 'application/json'
    };
    // if transientName is empty string, replace it with null
    transientName = transientName || null;
    let url = `${baseURL}?transient_name=${transientName}&physical_phenomena=${physicalPhenomena}&messenger_type=${messengerType}`;

    // Выполните запрос
    fetch(url, { headers })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Выводим полученные данные в консоль
        })
        .catch(error => {
            console.error("Ошибка при выполнении запроса:", error);
        });
}
