<script>
    import L from "leaflet";
    import { getLineRoute, getNearestStops } from "$lib/colectivos";
    import { setContext } from "svelte";

    let map;
    let routeLayout = L.polyline(L.latLng([0, 0]), { color: "red" });
    let userLocation;

    function createMap(container) {
        map = L.map(container);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        routeLayout.addTo(map);
    }
    function onMapClicked(e) {
        getNearestStops(e.latlng.lat, e.latlng.lng).then((stops) => {
            stops.forEach((stop) =>
                setMark({
                    latLng: [stop.Latitud, stop.Longitud],
                    popupText: stop.Lineas,
                })
            );
        });
    }
    function onLocationFound(e) {
        setMark({ latLng: e.latlng, popupText: "Tu ubicacion" });
        userLocation = e.latlng;

        /*         getNearestStops(userLocation.lat, userLocation.lng).then((stops) =>
            stops.forEach((stop) =>
                setMark({
                    latLng: [stop.Latitud, stop.Longitud],
                    popupText: stop.Descripcion,
                })
            )
        ); */
    }
    async function setRoute(line) {
        /* 
        En realidad no son rutas innecesarias es que una misma linea puede tener mas de un recorrido
        Ej: 105C, tiene un recorrido en el que va hasta una parte de la ruta 12 y da media vuelta,
        y otro en el que va hasta el pericho y recien ahi regresa, pero para simplificar mi trabajo
        voy a elegir mostrar la ruta mas extensa
        */
        const rutasInnecesarias = ["ESCE", "MUDA", "MOCH", "PEPU", "PUVI"];
        const routePoints = await getLineRoute(line);
        const routePointsLatLngs = routePoints
            .filter(
                (point) =>
                    !rutasInnecesarias.some(
                        (v) => point.AbreviaturaBanderaSMP === v
                    )
            )
            .map((point) => [point.Latitud, point.Longitud]);
        routeLayout.setLatLngs(routePointsLatLngs);
        map.fitBounds(routeLayout.getBounds());
    }
    function setMark({ latLng, popupText }) {
        L.marker(latLng).addTo(map).bindPopup(popupText);
        map.setView(latLng, 17);
    }
    function mapAction(container) {
        createMap(container);
        map.on("locationfound", onLocationFound);
        map.on("click", onMapClicked);
        map.locate();
    }

    setContext("map", { setRoute, setMark });
</script>

<link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
/>
<div>
    <div class="map" use:mapAction />
    <slot />
</div>

<style>
    div {
        height: 100%;
        width: 100%;
        z-index: 1;
    }
</style>
