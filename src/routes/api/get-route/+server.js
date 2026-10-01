import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
	const linea = url.searchParams.get('linea');
	const data = await restRequest('/recorridos?handler=RecuperarRecorridos', { codigoLinea: linea });
	const puntos = Array.isArray(data) ? data.flatMap((r) => r.puntos || []) : [];
	return json({ puntos });
}
