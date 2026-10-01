const BASE_URL = 'https://cuandollega.smartmovepro.net/corrientes';
const CSRF_TTL_MS = 5 * 60 * 1000;

let csrf = { token: null, cookie: null, fetchedAt: 0 };

async function getCsrf() {
	const now = Date.now();
	if (csrf.token && csrf.cookie && now - csrf.fetchedAt < CSRF_TTL_MS) {
		return csrf;
	}

	const response = await fetch(`${BASE_URL}/lineas`, { method: 'GET', redirect: 'follow' });
	const setCookieHeaders = response.headers.getSetCookie();
	const csrfCookie = setCookieHeaders.find((c) => c.startsWith('X-CSRF-TOKEN-CL='));
	const html = await response.text();
	const csrfMatch = html.match(/name="CSRF-TOKEN-CL-FORM"[^>]*value="([^"]*)"/);

	csrf = {
		token: csrfMatch ? csrfMatch[1] : null,
		cookie: csrfCookie ? csrfCookie.split(';')[0] : null,
		fetchedAt: now
	};
	return csrf;
}

export async function restRequest(endpoint, body = {}) {
	const { token, cookie } = await getCsrf();

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: 'POST',
		headers: {
			RequestVerificationToken: token,
			Cookie: cookie,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const text = await response.text();
	try {
		return JSON.parse(text);
	} catch {
		return { error: text };
	}
}

/** True for a usable payload (not an error object and not null). */
export function isData(data) {
	return data != null && !data.error;
}
