// Tipos TypeScript para la aplicación

export interface Line {
  CodigoLineaParada: string;
  Descripcion: string;
  [key: string]: any;
}

export interface Stop {
  Identificador: string;
  Descripcion: string;
  Latitud: number;
  Longitud: number;
  Lineas?: string;
  [key: string]: any;
}

export interface RoutePoint {
  Latitud: number;
  Longitud: number;
  AbreviaturaBanderaSMP: string;
  [key: string]: any;
}

export interface Arrival {
  Latitud: number;
  Longitud: number;
  Arribo: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}
