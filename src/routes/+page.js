export const prerender = true;
export const ssr = false;
export const csr = true;

import { browser } from '$app/environment';
import { repositorio } from '$lib/db/repository';
import { debug } from '$lib/logger';

const byDescription = (a, b) => parseInt(a.descripcion) - parseInt(b.descripcion);

function toLinea(l) {
	return {
		codigoLinea: String(l.codigo),
		descripcion: l.descripcion,
		createdAt: Date.now()
	};
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const forceRefresh = browser && localStorage.getItem('refrescarLineas');

	let cached = [];
	try {
		cached = await repositorio.getLineas();
	} catch (e) {
		console.error('[+page] cache read failed', e);
	}

	if (!forceRefresh && cached.length > 0) {
		cached.sort(byDescription);
		debug('[+page] cache HIT', cached.length, 'lines');
		if (browser && repositorio.debeLimpiarTabla(cached[0].createdAt)) {
			localStorage.setItem('refrescarLineas', true);
		}
		return { linesData: cached, isFromCache: true };
	}

	try {
		debug('[+page] cache MISS — fetching from API');
		const { lineas = [] } = await fetch('/api/get-lines').then((r) => r.json());
		const mapped = lineas.map(toLinea);
		await repositorio.clearLineas();
		await repositorio.addLineas(mapped);
		if (browser) localStorage.removeItem('refrescarLineas');
		return { linesData: mapped, isFromCache: false };
	} catch (e) {
		console.error('[+page] fetch failed', e);
		return { linesData: cached, isFromCache: true };
	}
}
