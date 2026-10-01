import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
	const latitud = url.searchParams.get('latitud');
	const longitud = url.searchParams.get('longitud');
	const data = await restRequest('/paradascercanas', { latitud, longitud });
	return json({ arribos: Array.isArray(data) ? data : [] });
}
