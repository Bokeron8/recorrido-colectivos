import Dexie, { Table } from 'dexie';

export interface Linea {
	codigoLinea: string;
	identificadorCl: string;
	descripcion: string;
	createdAt: number;
}

export interface CalleLinea {
	codigoLinea: string;
	codigoCalle: string;
	identificador: string;
	descripcion: string;
	descripcionLinea: string;
	latitud: number;
	longitud: number;
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
	lineas!: Table<Linea, [string, string]>;
	callesLinea!: Table<CalleLinea, [string, string]>;
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
	}
}

export const db = new CuandoLlegaDB();
export const dbReady = db.open().catch(() => {});
