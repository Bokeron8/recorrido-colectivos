export const prerender = true;
export const ssr = false;
export const csr = true;

import { repositorio, isStale } from '$lib/db/repository';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function refreshFromAPI(fetch) {
    try {
        const res = await fetch('/api/get-lines');
        const data = await res.json();
        const lineas = data.lineas.map(l => ({ ...l, createdAt: Date.now() }));
        await repositorio.clearLineas();
        await repositorio.addLineas(lineas);
        return lineas;
    } catch (e) {
        console.error('Failed to refresh lines', e);
        return null;
    }
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const id = window.location.pathname.split('/')[1].toLowerCase();
    const refrescarLineas = localStorage.getItem('refrescarLineas');

    try {
        const cachedLineas = await repositorio.getLineas(id);

        if (!refrescarLineas && cachedLineas.length > 0) {
            cachedLineas.sort((a, b) => parseInt(a.descripcion) - parseInt(b.descripcion));

            if (cachedLineas[0] && repositorio.debeLimpiarTabla(cachedLineas[0].createdAt)) {
                localStorage.setItem('refrescarLineas', true);
            }

            const cached = cachedLineas;
            refreshFromAPI(fetch);
            return { linesData: cached, isFromCache: true };
        } else {
            const data = await fetch('/api/get-lines');
            const json = await data.json();
            const lineas = json.lineas.map(l => ({ ...l, createdAt: Date.now() }));
            await repositorio.clearLineas();
            await repositorio.addLineas(lineas);
            localStorage.removeItem('refrescarLineas');
            return { linesData: lineas, isFromCache: false };
        }
    } catch (e) {
        console.error('Failed to load lines', e);
        const data = await fetch('/api/get-lines');
        const json = await data.json();
        return { linesData: json.lineas, isFromCache: false };
    }
}
