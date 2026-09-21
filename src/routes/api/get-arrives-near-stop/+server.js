import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
    const latitud = url.searchParams.get('latitud');
    const longitud = url.searchParams.get('longitud');
    const data = await restRequest('/paradascercanas', { latitud, longitud });
    if (data.error) {
        return new Response(JSON.stringify({ arribos: [] }));
    }
    return new Response(JSON.stringify({ arribos: Array.isArray(data) ? data : [] }));
}
