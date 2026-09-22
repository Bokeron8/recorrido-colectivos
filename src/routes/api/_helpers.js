const BASE_URL = "https://cuandollega.smartmovepro.net/corrientes";
const PAGE_URL = BASE_URL;

export async function restRequest(endpoint, body = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const getResponse = await fetch(PAGE_URL + "/lineas", { method: "GET", redirect: "follow" });
    const setCookieHeaders = getResponse.headers.getSetCookie();
    const csrfCookie = setCookieHeaders.find((c) => c.startsWith("X-CSRF-TOKEN-CL="));
    const cookie = csrfCookie ? csrfCookie.split(";")[0] : null;
    const html = await getResponse.text();
    const csrfMatch = html.match(/name="CSRF-TOKEN-CL-FORM"[^>]*value="([^"]*)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;
    const postResponse = await fetch(url, {
        method: "POST",
        headers: {
            RequestVerificationToken: csrfToken,
            Cookie: cookie,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const text = await postResponse.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return { error: text };
    }
}
