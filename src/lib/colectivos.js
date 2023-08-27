import L from "leaflet";
export async function getStopPointsByLine(linea) {
    const response = await fetch(`/api/get-stop-points?linea=${linea}`)
    const data = await response.json()

    return data.lineas;
}
export async function getArrives(linea, parada) {
    const response = await fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`)
    const data = await response.json()

    return data.arribos ? data.arribos : [];
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


const iconURL = new URL('images/colectivo-base.png', import.meta.url).href
export let myIcon = L.icon({
    iconUrl: iconURL,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
});