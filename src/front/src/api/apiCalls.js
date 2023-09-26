export function searchAPI(transientName, physicalPhenomena, messengerType) {
    // Определите базовый URL и заголовки
    const baseURL = 'https://lm-astronomy.labs.jb.gg/api/filter/';
    const headers = {
        'accept': 'application/json'
    };

    // Постройте URL на основе входных данных
    let url;
    if (transientName && !physicalPhenomena && !messengerType) {
        // Если предоставлено только имя или координаты
        url = `${baseURL}?object_name_or_coordinates=${encodeURIComponent(transientName)}&radius=5`;
    } else if (physicalPhenomena && messengerType) {
        // Если предоставлены тип события и тип объекта
        url = `${baseURL}?radius=3&event_type=${encodeURIComponent(messengerType)}&object_type=${encodeURIComponent(physicalPhenomena)}`;
    } else {
        // Если предоставлены все три параметра
        url = `${baseURL}?object_name_or_coordinates=${encodeURIComponent(transientName)}&radius=3&event_type=${encodeURIComponent(messengerType)}&object_type=${encodeURIComponent(physicalPhenomena)}`;
    }

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
