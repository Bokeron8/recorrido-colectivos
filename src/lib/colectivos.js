export async function getStopPointsByLine(linea) {
    const response = await fetch(`/api/get-stop-points?linea=${linea}`)
    const data = await response.json()

    return data.lineas;
}
export async function getArrives(linea, parada) {
    const response = await fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`)
    const data = await response.json()

    return data.arribos;
}
export async function getLineRoute(linea) {
    const response = await fetch(`/api/get-route?linea=${linea}`)
    const data = await response.json()

    return data.puntos;
}

export async function getNearestStops(lat, lng) {
    const response = await fetch(`/api/get-nearest-stops?latitud=${lat}&longitud=${lng}`)
    const data = await response.json()

    return data.paradas;
}

