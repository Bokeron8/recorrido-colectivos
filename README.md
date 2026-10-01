# Recorrido Colectivos — Corrientes

PWA para consultar los recorridos y la ubicación de los colectivos de Corrientes
capital. Muestra las líneas, las paradas de cada línea y los colectivos en tiempo
real sobre un mapa Leaflet.

## Stack

- **SvelteKit 1** + **Svelte 4** (`ssr = false`, `prerender = true`)
- **Leaflet** para el mapa
- **Dexie / IndexedDB** para caché en el cliente
- **Service Worker** (Cache API) con precache del shell y runtime cache de tiles
- API de `cuandollega.smartmovepro.net`, proxeada por las rutas `/api/*`

## Comandos

```bash
pnpm install
pnpm dev        # servidor de desarrollo
pnpm build      # build de producción
pnpm preview    # previsualizar el build
pnpm check      # svelte-check (tipos y a11y)
pnpm lint       # prettier --check + eslint
pnpm format     # aplicar prettier
```

## Estructura

```
src/
  service-worker.js      precache + runtime cache
  components/            Map, Input, InputGroup
  lib/
    config.js            constantes compartidas (TTL, colores, tiles)
    cache.js             cacheFirst + isStale
    colectivos.js        capa de recursos (API + caché)
    db/
      schema.ts          tablas Dexie
      repository.ts      operaciones sobre IndexedDB
    map/                 setup de Leaflet, icono y geometría
  routes/
    +page.js             carga de líneas con caché
    +page.svelte
    api/*                proxy a la API externa (mantiene el CSRF)
```

## Notas

- Las rutas en `src/routes/api/` se conservan aunque no todas se usen hoy; sirven
  como proxy y punto de extensión.
- La caché de paradas/recorridos es por línea (`codigoLinea`), no global.
- Elegí un adapter explícito (`@sveltejs/adapter-node`, `adapter-vercel`, etc.)
  según el hosting antes de desplegar; los endpoints `/api/*` requieren servidor.
