import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
    const parada = url.searchParams.get('parada');
    const linea = url.searchParams.get('linea');
    const data = await restRequest(`/arribos?codLinea=${linea}&idParada=${parada}`, { codLinea: linea, idParada: parada });
    if (data.error) {
        return new Response(JSON.stringify({ arribos: [] }));
    }
    return new Response(JSON.stringify({ arribos: data.arribos || [] }));
}
