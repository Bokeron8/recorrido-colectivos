// Configuración de la aplicación
export const SOAP_CONFIG = {
  BASE_URL: 'http://clswcorrientes.smartmovepro.net/ModuloParadas/SWParadas.asmx',
  USUARIO: 'WEB.CORRIENTES',
  CLAVE: 'PAR.SW.CORRIENTES',
  LOCALIDAD: 'CORRIENTES',
  PROVINCIA: 'CORRIENTES',
  PAIS: 'Argentina',
  CODIGO_APLICACION: '24',
  LISTA_CODIGOS_EMPRESA: '358',
};

import Constants from 'expo-constants';

// Configuración de Mapbox
// Token is loaded from app.json extra field (set via MAPBOX_PUBLIC_TOKEN env var at build time)
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: (Constants.expoConfig?.extra as any)?.mapboxToken || '',
};

// Configuración del mapa
export const MAP_CONFIG = {
  INITIAL_CENTER: [-58.831861, -27.467917] as [number, number], // [longitude, latitude] for Mapbox
  INITIAL_ZOOM: 13,
  UPDATE_INTERVAL: 5000, // 5 segundos
};

// Rutas innecesarias (para filtrar recorridos)
export const RUTAS_INNECESARIAS = [
  'ESCE',
  'MUDA',
  'MOCH',
  'PEPU',
  'PUVI',
  'I-17PUERTO',
  'I-ESDR',
  'V-DRES',
  'I-VIPU',
  'I-PEPU',
];

// Colores para las rutas
export const ROUTE_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
