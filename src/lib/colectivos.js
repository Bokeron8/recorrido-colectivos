import L from "leaflet";
import { repositorio } from '$lib/db/repository';
import { isStale } from '$lib/db/repository';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RECORRIDO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function cacheFirst(cacheFn, fetchFn, addCacheFn, ttl = CACHE_TTL_MS) {
    try {
        const cached = await cacheFn();
        if (cached.length > 0 && !isStale(cached[0].createdAt, ttl)) {
            return cached;
        }
        const data = await fetchFn();
        await addCacheFn(data);
        return data;
    } catch (e) {
        const cached = await cacheFn();
        if (cached.length > 0) return cached;
        const data = await fetchFn();
        await addCacheFn(data);
        return data;
    }
}

export async function getStopPointsByLine(linea) {
    if (!linea) return [];
    const lineaStr = String(linea);
    return cacheFirst(
        () => repositorio.getCalles(lineaStr),
        () => fetch(`/api/get-stop-points?linea=${linea}`).then(r => r.json()).then(d => d.lineas),
        async (data) => {
            const mapped = data.map(p => ({
                codigoLinea: lineaStr,
                codigoCalle: p.codigo,
                descripcion: p.descripcion,
                descripcionLinea: p.descripcion,
                createdAt: Date.now()
            }));
            await repositorio.clearCalles();
            await repositorio.addCalles(mapped);
        }
    );
}

export async function getArrives(linea, parada) {
    if (!linea || !parada) return [];
    return fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`).then(r => r.json()).then(d => d.arribos || []);
}

export async function getLineRoute(linea) {
    if (!linea) return [];
    const lineaStr = String(linea);
    return cacheFirst(
        () => repositorio.getRecorridos(lineaStr),
        () => fetch(`/api/get-route?linea=${lineaStr}`).then(r => r.json()).then(d => d.puntos),
        async (puntos) => {
            const data = [{ descripcion: lineaStr, puntos }];
            await repositorio.clearRecorridos();
            await repositorio.addRecorridosApi(data, lineaStr);
        },
        RECORRIDO_TTL_MS
    );
}

export async function getNearestStops(lat, lng) {
    return fetch(`/api/get-nearest-stops?latitud=${lat}&longitud=${lng}`).then(r => r.json()).then(d => d.paradas);
}

export async function getLineasFromCache(id) {
    return repositorio.getLineas(id);
}

export async function getRecorridosFromCache(linea) {
    const lineaStr = String(linea);
    return cacheFirst(
        () => repositorio.getRecorridos(lineaStr),
        async () => {
            const res = await fetch(`/api/get-arrives?handler=RecuperarRecorridos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigoLinea: lineaStr })
            });
            const json = await res.json();
            return json;
        },
        async (data) => {
            await repositorio.addRecorridosApi(data, lineaStr);
        },
        RECORRIDO_TTL_MS
    );
}

const iconURL = new URL('images/colectivo-base.png', import.meta.url).href
export let myIcon = L.icon({
    iconUrl: iconURL,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
});
