import Dexie, { Table } from 'dexie';

export interface Linea {
	codigoLinea: string;
	descripcion: string;
	createdAt: number;
}

export interface Recorrido {
	codigoLinea: string;
	id: string;
	bandera: string;
	descripcion: string;
	createdAt: number;
	puntos: unknown[];
	paradas: unknown[];
	color: string;
}

export class CuandoLlegaDB extends Dexie {
	lineas!: Table<Linea, string>;
	recorridos!: Table<Recorrido, [string, string]>;

	constructor() {
		super('DBCuandoLlega');

		this.version(1).stores({
			lineas: '[identificadorCl+codigoLinea]',
			callesLinea: '[codigoLinea+codigoCalle]',
			intersecCalleLinea: '[codigoLinea+codigoCalle+codigoInterseccion], codigoLinea, codigoCalle',
			paradas: '[codigoLinea+identificadorParada], codigoLinea, codigoCalle, codigoInterseccion',
			favoritos: '&identificadorParada, codigoLinea, identificadorCl',
			recorridos: '[codigoLinea+id], *puntos'
		});

		// v2: drop the unused tables and index codigoLinea for per-line caching.
		this.version(2).stores({
			lineas: '[identificadorCl+codigoLinea], identificadorCl',
			callesLinea: '[codigoLinea+codigoCalle], codigoLinea',
			recorridos: '[codigoLinea+id], codigoLinea, *puntos'
		});

		// v3: stops now come from the cached recorridos, drop callesLinea.
		this.version(3).stores({
			lineas: '[identificadorCl+codigoLinea], identificadorCl',
			recorridos: '[codigoLinea+id], codigoLinea, *puntos'
		});

		// v4: identificadorCl was always empty, key lines by codigoLinea.
		this.version(4).stores({
			lineas: 'codigoLinea',
			recorridos: '[codigoLinea+id], codigoLinea, *puntos'
		});

		// v5: recorridos rows now mirror each API route (and carry paradas),
		// so drop the old single-row-per-line cache.
		this.version(5)
			.stores({
				lineas: 'codigoLinea',
				recorridos: '[codigoLinea+id], codigoLinea, *puntos'
			})
			.upgrade((tx) => tx.table('recorridos').clear());
	}
}

export const db = new CuandoLlegaDB();
export const dbReady = db.open().catch(() => {});
