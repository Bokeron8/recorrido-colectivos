import { ROUTE_COLORS } from '$lib/config';
import { isStale } from '$lib/cache';
import { debug } from '$lib/logger';
import { db, dbReady } from './schema';
import type { Linea, Recorrido } from './schema';

async function ensureDb(): Promise<void> {
	try {
		await dbReady;
		if (!db.isOpen()) await db.open();
	} catch (e) {
		console.error('[Dexie] DB not ready', e);
		throw e;
	}
}

function logError(context: string, e: unknown): void {
	console.error(`[DexieRepository][${context}]`, e);
}

class CuandoLlegaRepository {
	// --- LINEAS ---
	async addLineas(lineas: Linea[]): Promise<void> {
		try {
			await ensureDb();
			await db.lineas.bulkAdd(lineas);
			debug(`[Dexie] Added ${lineas.length} lines`);
		} catch (e) {
			logError('addLineas', e);
			throw e;
		}
	}

	async getLineas(identificadorCl: string): Promise<Linea[]> {
		try {
			await ensureDb();
			return db.lineas.where('identificadorCl').equals(identificadorCl).toArray();
		} catch (e) {
			logError('getLineas', e);
			return [];
		}
	}

	async clearLineas(): Promise<void> {
		try {
			await ensureDb();
			await db.lineas.clear();
		} catch (e) {
			logError('clearLineas', e);
			throw e;
		}
	}

	// --- RECORRIDOS ---
	async addRecorridosApi(data: any[], codigoLinea: string): Promise<void> {
		const lineaStr = String(codigoLinea);
		await ensureDb();
		const recorridos: Recorrido[] = data.map((r, i) => {
			let id, bandera, descripcion;
			if (typeof r.descripcion === 'string' && r.descripcion.includes(';')) {
				const [rawId, rawBandera, rawDescripcion] = r.descripcion.split(';');
				id = rawId;
				bandera = rawBandera;
				descripcion = rawDescripcion;
			} else {
				id = String(r.id || r.codigo || i);
				bandera = r.bandera || '';
				descripcion = String(r.descripcion ?? '');
			}
			return {
				codigoLinea: lineaStr,
				id,
				bandera,
				descripcion,
				createdAt: Date.now(),
				puntos: r.puntos || [],
				paradas: r.paradas || [],
				color: ROUTE_COLORS[i % ROUTE_COLORS.length]
			};
		});
		await db.recorridos.bulkPut(recorridos);
		debug(`[Dexie] addRecorridosApi: added ${recorridos.length} recorridos for line ${lineaStr}`);
	}

	async getRecorridos(codigoLinea: string): Promise<Recorrido[]> {
		try {
			await ensureDb();
			return db.recorridos.where('codigoLinea').equals(String(codigoLinea)).toArray();
		} catch (e) {
			logError('getRecorridos', e);
			return [];
		}
	}

	async deleteRecorridosByLine(codigoLinea: string): Promise<void> {
		try {
			await ensureDb();
			await db.recorridos.where('codigoLinea').equals(String(codigoLinea)).delete();
		} catch (e) {
			logError('deleteRecorridosByLine', e);
			throw e;
		}
	}

	// --- STALE CHECKS ---
	debeLimpiarTabla(createdAt: number): boolean {
		return isStale(createdAt);
	}
}

export const repositorio = new CuandoLlegaRepository();
