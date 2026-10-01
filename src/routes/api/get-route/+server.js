import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
	const linea = url.searchParams.get('linea');
	const data = await restRequest('/recorridos?handler=RecuperarRecorridos', {
		codigoLinea: linea
	});
	return json({ recorridos: Array.isArray(data) ? data : [] });
}
