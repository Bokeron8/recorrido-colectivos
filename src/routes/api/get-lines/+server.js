import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET() {
	const data = await restRequest('/lineas', {});
	return json({ lineas: Array.isArray(data) ? data : [] });
}
