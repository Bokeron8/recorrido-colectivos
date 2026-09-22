export const prerender = true;
export const ssr = false;
export const csr = true;

import { repositorio } from '$lib/db/repository';
import { dbReady } from '$lib/db/schema';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    await dbReady;

    const id = window.location.pathname.split('/')[1].toLowerCase();
    const refrescarLineas = localStorage.getItem('refrescarLineas');

    try {
        const cachedLineas = await repositorio.getLineas(id);

        if (!refrescarLineas && cachedLineas.length > 0) {
            cachedLineas.sort((a, b) => parseInt(a.descripcion) - parseInt(b.descripcion));
            console.log('[+page] Cache HIT', cachedLineas.length, 'lines');

            if (cachedLineas[0] && repositorio.debeLimpiarTabla(cachedLineas[0].createdAt)) {
                localStorage.setItem('refrescarLineas', true);
            }

            return { linesData: cachedLineas, isFromCache: true };
        } else {
            console.log('[+page] Cache MISS — fetching from API');
            const data = await fetch('/api/get-lines');
            const json = await data.json();
            const lineas = json.lineas.map(l => ({
                codigoLinea: l.codigo,
                identificadorCl: id,
                descripcion: l.descripcion,
                createdAt: Date.now()
            }));
            await repositorio.clearLineas();
            await repositorio.addLineas(lineas);
            localStorage.removeItem('refrescarLineas');
            return { linesData: lineas, isFromCache: false };
        }
    } catch (e) {
        console.error('[+page] Failed to load lines', e);
        const data = await fetch('/api/get-lines');
        const json = await data.json();
        return { linesData: json.lineas, isFromCache: false };
    }
}
