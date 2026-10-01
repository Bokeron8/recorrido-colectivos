import { CACHE_TTL_MS, ROUTE_TTL_MS } from '$lib/config';
import { cacheFirst } from '$lib/cache';
import { repositorio } from '$lib/db/repository';

function toStopPoint(lineaStr, p) {
	return {
		codigoLinea: lineaStr,
		codigoCalle: p.codigo,
		identificador: p.identificador,
		descripcion: p.descripcion,
		descripcionLinea: p.descripcion,
		latitud: p.latitud,
		longitud: p.longitud,
		createdAt: Date.now()
	};
}

export async function getStopPointsByLine(linea) {
	if (!linea) return [];
	const lineaStr = String(linea);

	return cacheFirst({
		read: () => repositorio.getCalles(lineaStr),
		fetchFn: async () => {
			const { lineas = [] } = await fetch(`/api/get-stop-points?linea=${lineaStr}`).then((r) =>
				r.json()
			);
			return lineas.map((p) => toStopPoint(lineaStr, p));
		},
		write: async (calles) => {
			await repositorio.deleteCallesByLine(lineaStr);
			await repositorio.addCalles(calles);
		},
		ttl: CACHE_TTL_MS
	});
}

export async function getArrives(linea, parada) {
	if (!linea || !parada) return [];
	return fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`)
		.then((r) => r.json())
		.then((d) => d.arribos || []);
}

export async function getLineRoute(linea) {
	if (!linea) return [];
	const lineaStr = String(linea);

	const recorridos = await cacheFirst({
		read: () => repositorio.getRecorridos(lineaStr),
		fetchFn: () =>
			fetch(`/api/get-route?linea=${lineaStr}`)
				.then((r) => r.json())
				.then((d) => [{ descripcion: lineaStr, puntos: d.puntos || [], createdAt: Date.now() }]),
		write: async (data) => {
			await repositorio.deleteRecorridosByLine(lineaStr);
			await repositorio.addRecorridosApi(data, lineaStr);
		},
		ttl: ROUTE_TTL_MS
	});

	return recorridos.flatMap((r) => r.puntos || []);
}

export async function getNearestStops(lat, lng) {
	return fetch(`/api/get-nearest-stops?latitud=${lat}&longitud=${lng}`)
		.then((r) => r.json())
		.then((d) => d.paradas || []);
}
