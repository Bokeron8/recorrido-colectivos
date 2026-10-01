import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
	const linea = url.searchParams.get('linea');
	const data = await restRequest(`/calles?codLinea=${linea}`, {});
	return json({ lineas: Array.isArray(data) ? data : [] });
}
