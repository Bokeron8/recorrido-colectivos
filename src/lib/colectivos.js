import { ROUTE_TTL_MS } from '$lib/config';
import { cacheFirst } from '$lib/cache';
import { repositorio } from '$lib/db/repository';

/** Normalize a raw `paradas` item from RecuperarRecorridos. */
function toStop(parada) {
	return {
		codigo: parada.codigo,
		identificador: parada.identificador,
		descripcion: parada.descripcion,
		latitud: Number(parada.latitudParada),
		longitud: Number(parada.longitudParada)
	};
}

/** A stop can appear in more than one route; keep one entry per description. */
function uniqueByDescription(paradas) {
	const seen = new Set();
	return paradas.filter((parada) => {
		if (seen.has(parada.descripcion)) return false;
		seen.add(parada.descripcion);
		return true;
	});
}

/**
 * Everything needed when a line is selected: route geometry from `puntos` and
 * the selectable stops from `paradas`, both from RecuperarRecorridos (cached).
 */
export async function getLineData(linea) {
	if (!linea) return { puntos: [], paradas: [] };
	const lineaStr = String(linea);

	const recorridos = await cacheFirst({
		read: () => repositorio.getRecorridos(lineaStr),
		fetchFn: () =>
			fetch(`/api/get-route?linea=${lineaStr}`)
				.then((r) => r.json())
				.then((d) => d.recorridos || []),
		write: async (data) => {
			await repositorio.deleteRecorridosByLine(lineaStr);
			await repositorio.addRecorridosApi(data, lineaStr);
		},
		ttl: ROUTE_TTL_MS
	});

	const puntos = recorridos.flatMap((r) => r.puntos || []);
	const paradas = uniqueByDescription(recorridos.flatMap((r) => r.paradas || []))
		.map(toStop)
		.filter((stop) => Number.isFinite(stop.latitud) && Number.isFinite(stop.longitud));

	return { puntos, paradas };
}

export async function getArrives(linea, parada) {
	if (!linea || !parada) return [];
	return fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`)
		.then((r) => r.json())
		.then((d) => d.arribos || []);
}

export async function getNearestStops(lat, lng) {
	return fetch(`/api/get-nearest-stops?latitud=${lat}&longitud=${lng}`)
		.then((r) => r.json())
		.then((d) => d.paradas || []);
}
