import Dexie from 'dexie';
import { db } from './schema';
import type { Linea, CalleLinea, IntersecCalleLinea, Parada, Favorito, Recorrido } from './schema';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const RECORRIDO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isStale(createdAt: number, ttl: number = CACHE_TTL_MS): boolean {
    return Date.now() - createdAt > ttl;
}

function isStaleDias(createdAt: number, dias: number): boolean {
    return Date.now() - createdAt > dias * 24 * 60 * 60 * 1000;
}

class CuandoLlegaRepository {
    // --- LINEAS ---
    async addLineas(lineas: Linea[]): Promise<void> {
        await db.lineas.bulkAdd(lineas);
    }

    async getLineas(identificadorCl: string): Promise<Linea[]> {
        return db.lineas.where('identificadorCl').equals(identificadorCl).toArray();
    }

    async clearLineas(): Promise<void> {
        await db.lineas.clear();
    }

    // --- CALLES ---
    async addCalles(calles: CalleLinea[]): Promise<void> {
        await db.callesLinea.bulkAdd(calles);
    }

    async getCalles(codigoLinea: string) {
        return db.callesLinea.where('[codigoLinea+codigoCalle]').between([codigoLinea, Dexie.minKey], [codigoLinea, Dexie.maxKey]).toArray();
    }

    async getCalle(codigoLinea: string, codigoCalle: string) {
        return db.callesLinea.where({ codigoLinea, codigoCalle }).first();
    }

    async clearCalles(): Promise<void> {
        await db.callesLinea.clear();
    }

    // --- INTERSECCIONES ---
    async addIntersecciones(intersecciones: IntersecCalleLinea[]): Promise<void> {
        await db.intersecCalleLinea.bulkAdd(intersecciones);
    }

    async getIntersecciones(codigoLinea: string, codigoCalle: string) {
        return db.intersecCalleLinea.where({ codigoLinea, codigoCalle }).toArray();
    }

    async getInterseccion(codigoLinea: string, codigoCalle: string, codigoInterseccion: string) {
        return db.intersecCalleLinea.where({ codigoLinea, codigoCalle, codigoInterseccion }).first();
    }

    async clearIntersecciones(): Promise<void> {
        await db.intersecCalleLinea.clear();
    }

    // --- PARADAS ---
    async addParadas(paradas: Parada[]): Promise<void> {
        await db.paradas.bulkAdd(paradas);
    }

    async getParadas(codigoLinea: string, codigoCalle: string, codigoInterseccion: string) {
        return db.paradas.where({ codigoLinea, codigoCalle, codigoInterseccion }).toArray();
    }

    async getParada(codigoLinea: string, identificadorParada: string) {
        return db.paradas.where({ codigoLinea, identificadorParada }).first();
    }

    async clearParadas(): Promise<void> {
        await db.paradas.clear();
    }

    // --- FAVORITOS ---
    async getFavoritos(): Promise<Favorito[]> {
        return db.favoritos.toArray();
    }

    async addFavoritos(favoritos: Favorito[]): Promise<void> {
        await db.favoritos.bulkAdd(favoritos);
    }

    // --- RECORRIDOS ---
    async addRecorridos(recorridos: Recorrido[]): Promise<void> {
        await db.recorridos.bulkAdd(recorridos);
    }

    async addRecorridosApi(data: any[], codigoLinea: string): Promise<void> {
        const colores = ['#0000ff', '#ff0000', '#008000', '#ff00ff', '#000080', '#808000', '#ffa500', '#a52a2a', '#00ffff', '#9932cc', '#e9967a', '#90ee90'];
        let i = 0;
        for (const r of data) {
            const aux = r.descripcion.split(';');
            const id = aux[0];
            const bandera = aux[1];
            const descripcion = aux[2];
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
        }
    }

    async getRecorridos(codigoLinea: string) {
        return db.recorridos.where('[codigoLinea+id]').between([codigoLinea, Dexie.minKey], [codigoLinea, Dexie.maxKey]).toArray();
    }

    async clearRecorridos(): Promise<void> {
        await db.recorridos.clear();
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
        await db.clear();
    }
}

export const repositorio = new CuandoLlegaRepository();
export { isStale, isStaleDias };
