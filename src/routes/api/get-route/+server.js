import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
    const linea = url.searchParams.get('linea');
    const data = await restRequest('/recorridos?handler=RecuperarRecorridos', { codigoLinea: linea });
    if (data.error || !Array.isArray(data)) {
        return new Response(JSON.stringify({ puntos: [] }));
    }
    const puntos = data.flatMap(r => r.puntos || []);
    return new Response(JSON.stringify({ puntos }));
}
