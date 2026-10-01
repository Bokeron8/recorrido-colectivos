/// <reference types="@sveltejs/kit" />
import { base, build, files, prerendered, version } from '$service-worker';

const CACHE_PREFIX = 'recorrido-colectivos';
const APP_CACHE = `${CACHE_PREFIX}-app-${version}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime`;
const TILE_CACHE = `${CACHE_PREFIX}-tiles`;
const MAX_TILE_ENTRIES = 300;

const OFFLINE_URL = base ? `${base}/` : '/';

/** App shell: everything the browser needs to boot offline. */
const PRECACHE = [...new Set(['/', ...build, ...files, ...prerendered])];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(APP_CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== APP_CACHE && key !== RUNTIME_CACHE && key !== TILE_CACHE)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('message', (event) => {
	if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);

	if (request.mode === 'navigate') {
		event.respondWith(networkFirstNavigation(request));
		return;
	}

	if (url.origin === self.location.origin) {
		// Data caching is handled by Dexie/IndexedDB, not the service worker.
		if (url.pathname.startsWith('/api/')) return;

		if (PRECACHE.includes(url.pathname)) {
			event.respondWith(cacheFirst(request, APP_CACHE));
			return;
		}
		event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
		return;
	}

	if (url.hostname.endsWith('tile.openstreetmap.org')) {
		event.respondWith(staleWhileRevalidate(request, TILE_CACHE, MAX_TILE_ENTRIES));
	}
});

async function cacheFirst(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok) cache.put(request, response.clone());
	return response;
}

async function networkFirstNavigation(request) {
	const cache = await caches.open(APP_CACHE);
	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(OFFLINE_URL, response.clone());
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error();
	}
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);

	const network = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone());
				if (maxEntries) trimCache(cacheName, maxEntries);
			}
			return response;
		})
		.catch(() => cached);

	return cached || network;
}

async function trimCache(cacheName, maxEntries) {
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	if (keys.length <= maxEntries) return;
	await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}
