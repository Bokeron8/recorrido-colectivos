import { restRequest } from '../_helpers.js';

export async function GET() {
    const data = await restRequest('/lineas', {});
    return new Response(JSON.stringify({ lineas: data }));
}
