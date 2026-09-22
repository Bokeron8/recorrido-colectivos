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
    descripcion: string;
    descripcionLinea: string;
    createdAt: number;
}

export interface IntersecCalleLinea {
    codigoLinea: string;
    codigoCalle: string;
    codigoInterseccion: string;
    [key: string]: unknown;
}

export interface Parada {
    codigoLinea: string;
    identificadorParada: string;
    codigoCalle: string;
    codigoInterseccion: string;
    [key: string]: unknown;
}

export interface Favorito {
    identificadorParada: string;
    codigoLinea: string;
    identificadorCl: string;
    [key: string]: unknown;
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
    intersecCalleLinea!: Table<IntersecCalleLinea, [string, string, string]>;
    paradas!: Table<Parada, [string, string]>;
    favoritos!: Table<Favorito, string>;
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
    }
}

export const db = new CuandoLlegaDB();
export const dbReady = db.open().catch(() => {});
