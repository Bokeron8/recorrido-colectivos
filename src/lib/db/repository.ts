import Dexie from 'dexie';
import { db, dbReady } from './schema';
import type { Linea, CalleLinea, IntersecCalleLinea, Parada, Favorito, Recorrido } from './schema';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RECORRIDO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function ensureDb(): Promise<void> {
    try {
        await dbReady;
        if (!db.isOpen()) {
            await db.open();
        }
        console.log('[Dexie] DB ready, isOpen:', db.isOpen());
    } catch (e) {
        console.error('[Dexie] DB not ready:', e);
        throw e;
    }
}

function logError(context: string, e: unknown): void {
    console.error(`[DexieRepository][${context}]`, e);
}

function isStale(createdAt: number, ttl: number = CACHE_TTL_MS): boolean {
    return Date.now() - createdAt > ttl;
}

function isStaleDias(createdAt: number, dias: number): boolean {
    return Date.now() - createdAt > dias * 24 * 60 * 60 * 1000;
}

class CuandoLlegaRepository {
    // --- LINEAS ---
    async addLineas(lineas: Linea[]): Promise<void> {
        try {
            await ensureDb();
            await db.lineas.bulkAdd(lineas);
            console.log(`[Dexie] Added ${lineas.length} lines`);
        } catch (e) {
            logError('addLineas', e);
            throw e;
        }
    }

    async getLineas(identificadorCl: string): Promise<Linea[]> {
        try {
            await ensureDb();
            const result = await db.lineas.where('identificadorCl').equals(identificadorCl).toArray();
            console.log(`[Dexie] getLineas(${identificadorCl}): ${result.length} results`);
            return result;
        } catch (e) {
            logError('getLineas', e);
            return [];
        }
    }

    async clearLineas(): Promise<void> {
        try {
            await ensureDb();
            await db.lineas.clear();
            console.log('[Dexie] Cleared lineas');
        } catch (e) {
            logError('clearLineas', e);
            throw e;
        }
    }

    // --- CALLES ---
    async addCalles(calles: CalleLinea[]): Promise<void> {
        try {
            await ensureDb();
            await db.callesLinea.bulkAdd(calles);
            console.log(`[Dexie] Added ${calles.length} calles`);
        } catch (e) {
            logError('addCalles', e);
            throw e;
        }
    }

    async getCalles(codigoLinea: string) {
        try {
            await ensureDb();
            return db.callesLinea.where('[codigoLinea+codigoCalle]').between([codigoLinea, Dexie.minKey], [codigoLinea, Dexie.maxKey]).toArray();
        } catch (e) {
            logError('getCalles', e);
            return [];
        }
    }

    async getCalle(codigoLinea: string, codigoCalle: string) {
        try {
            await ensureDb();
            return db.callesLinea.where({ codigoLinea, codigoCalle }).first();
        } catch (e) {
            logError('getCalle', e);
            return undefined;
        }
    }

    async clearCalles(): Promise<void> {
        try {
            await ensureDb();
            await db.callesLinea.clear();
            console.log('[Dexie] Cleared calles');
        } catch (e) {
            logError('clearCalles', e);
            throw e;
        }
    }

    // --- INTERSECCIONES ---
    async addIntersecciones(intersecciones: IntersecCalleLinea[]): Promise<void> {
        try {
            await ensureDb();
            await db.intersecCalleLinea.bulkAdd(intersecciones);
        } catch (e) {
            logError('addIntersecciones', e);
            throw e;
        }
    }

    async getIntersecciones(codigoLinea: string, codigoCalle: string) {
        try {
            await ensureDb();
            return db.intersecCalleLinea.where({ codigoLinea, codigoCalle }).toArray();
        } catch (e) {
            logError('getIntersecciones', e);
            return [];
        }
    }

    async clearIntersecciones(): Promise<void> {
        try {
            await ensureDb();
            await db.intersecCalleLinea.clear();
        } catch (e) {
            logError('clearIntersecciones', e);
            throw e;
        }
    }

    // --- PARADAS ---
    async addParadas(paradas: Parada[]): Promise<void> {
        try {
            await ensureDb();
            await db.paradas.bulkAdd(paradas);
            console.log(`[Dexie] Added ${paradas.length} paradas`);
        } catch (e) {
            logError('addParadas', e);
            throw e;
        }
    }

    async getParadas(codigoLinea: string, codigoCalle: string, codigoInterseccion: string) {
        try {
            await ensureDb();
            return db.paradas.where({ codigoLinea, codigoCalle, codigoInterseccion }).toArray();
        } catch (e) {
            logError('getParadas', e);
            return [];
        }
    }

    async clearParadas(): Promise<void> {
        try {
            await ensureDb();
            await db.paradas.clear();
        } catch (e) {
            logError('clearParadas', e);
            throw e;
        }
    }

    // --- FAVORITOS ---
    async getFavoritos(): Promise<Favorito[]> {
        try {
            await ensureDb();
            return db.favoritos.toArray();
        } catch (e) {
            logError('getFavoritos', e);
            return [];
        }
    }

    async addFavoritos(favoritos: Favorito[]): Promise<void> {
        try {
            await ensureDb();
            await db.favoritos.bulkAdd(favoritos);
        } catch (e) {
            logError('addFavoritos', e);
            throw e;
        }
    }

    // --- RECORRIDOS ---
    async addRecorridos(recorridos: Recorrido[]): Promise<void> {
        try {
            await ensureDb();
            await db.recorridos.bulkAdd(recorridos);
            console.log(`[Dexie] Added ${recorridos.length} recorridos`);
        } catch (e) {
            logError('addRecorridos', e);
            throw e;
        }
    }

    async addRecorridosApi(data: any[], codigoLinea: string): Promise<void> {
        const colores = ['#0000ff', '#ff0000', '#008000', '#ff00ff', '#000080', '#808000', '#ffa500', '#a52a2a', '#00ffff', '#9932cc', '#e9967a', '#90ee90'];
        let i = 0;
        for (const r of data) {
            try {
                await ensureDb();
                let id, bandera, descripcion;
                if (typeof r.descripcion === 'string' && r.descripcion.includes(';')) {
                    const aux = r.descripcion.split(';');
                    id = aux[0];
                    bandera = aux[1];
                    descripcion = aux[2];
                } else {
                    id = String(r.id || r.codigo || i);
                    bandera = r.bandera || '';
                    descripcion = typeof r.descripcion === 'string' ? r.descripcion : String(r.descripcion);
                }
                const puntos = r.puntos;
                const paradas = r.paradas;
                const color = colores[i % colores.length];
                const createdAt = Date.now();
                await db.recorridos.add({
                    codigoLinea,
                    id,
                    bandera,
                    descripcion,
                    createdAt,
                    puntos,
                    paradas,
                    color
                });
                i++;
            } catch (e) {
                logError(`addRecorridosApi item ${i}`, e);
                throw e;
            }
        }
        console.log(`[Dexie] addRecorridosApi: added ${data.length} recorridos for line ${codigoLinea}`);
    }

    async getRecorridos(codigoLinea: string) {
        try {
            await ensureDb();
            const result = await db.recorridos.where('[codigoLinea+id]').between([codigoLinea, Dexie.minKey], [codigoLinea, Dexie.maxKey]).toArray();
            console.log(`[Dexie] getRecorridos(${codigoLinea}): ${result.length} results`);
            return result;
        } catch (e) {
            logError('getRecorridos', e);
            return [];
        }
    }

    async clearRecorridos(): Promise<void> {
        try {
            await ensureDb();
            await db.recorridos.clear();
            console.log('[Dexie] Cleared recorridos');
        } catch (e) {
            logError('clearRecorridos', e);
            throw e;
        }
    }

    // --- STALE CHECKS ---
    debeLimpiarTabla(createdAt: number): boolean {
        return isStale(createdAt);
    }

    debeLimpiarTablaDias(createdAt: number, dias: number): boolean {
        return isStaleDias(createdAt, dias);
    }

    // --- CLEAR ALL ---
    async clearAll(): Promise<void> {
        try {
            await ensureDb();
            await db.clear();
            console.log('[Dexie] Cleared all tables');
        } catch (e) {
            logError('clearAll', e);
            throw e;
        }
    }
}

export const repositorio = new CuandoLlegaRepository();
export { isStale, isStaleDias };
