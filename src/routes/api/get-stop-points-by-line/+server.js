import { json } from '@sveltejs/kit';
import { restRequest } from '../_helpers.js';

export async function GET({ url }) {
	const linea = url.searchParams.get('linea');
	const data = await restRequest('/recorridos?handler=RecuperarRecorridos', { codigoLinea: linea });
	if (!Array.isArray(data)) return json({ lineas: [] });

	const paradas = data.flatMap((r) =>
		(r.paradas || []).map((p) => ({
			codigo: p.codigo,
			identificador: p.identificador,
			descripcion: p.descripcion,
			abreviaturaBandera: p.abreviaturaBandera,
			abreviaturaAmpliadaBandera: p.abreviaturaAmpliadaBandera,
			latitud: p.latitudParada,
			longitud: p.longitudParada
		}))
	);
	return json({ lineas: paradas });
}
