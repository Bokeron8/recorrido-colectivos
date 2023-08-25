export const prerender = true;
export const ssr = false;
export const csr = true;


/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    const response = await fetch("/api/get-lines")
    const data = await response.json()
    return { linesData: data.lineas }
}
