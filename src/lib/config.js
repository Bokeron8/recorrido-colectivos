/** Shared constants for the app. */

/** How long cached API data (lines, stops) stays fresh. */
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** How long route geometry stays fresh. */
export const ROUTE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Route flags that are variants we intentionally skip when drawing. */
export const IGNORED_ROUTE_FLAGS = [
	'ESCE',
	'MUDA',
	'MOCH',
	'PEPU',
	'PUVI',
	'I-17PUERTO',
	'I-ESDR',
	'V-DRES',
	'I-VIPU',
	'I-PEPU'
];

/** Palette used to tell apart different routes of the same line. */
export const ROUTE_COLORS = [
	'#0000ff',
	'#ff0000',
	'#008000',
	'#ff00ff',
	'#000080',
	'#808000',
	'#ffa500',
	'#a52a2a',
	'#00ffff',
	'#9932cc',
	'#e9967a',
	'#90ee90'
];

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '© OpenStreetMap';
export const TILE_MAX_ZOOM = 19;
