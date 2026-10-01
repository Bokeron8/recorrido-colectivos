import { CACHE_TTL_MS } from '$lib/config';

export function isStale(createdAt, ttl = CACHE_TTL_MS) {
	return Date.now() - createdAt > ttl;
}

/**
 * Read-through cache. `read` returns cached rows (each with `createdAt`),
 * `fetchFn` returns fresh rows in the same shape and `write` persists them.
 */
export async function cacheFirst({ read, fetchFn, write, ttl = CACHE_TTL_MS }) {
	let cached = [];
	try {
		cached = await read();
	} catch (e) {
		console.error('[cache] read failed', e);
	}

	if (cached.length > 0 && !isStale(cached[0].createdAt, ttl)) {
		return cached;
	}

	try {
		const data = await fetchFn();
		await write(data);
		return data;
	} catch (e) {
		if (cached.length > 0) return cached;
		throw e;
	}
}
