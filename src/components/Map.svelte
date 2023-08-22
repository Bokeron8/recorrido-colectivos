<script>
    import L from "leaflet";
    import { getLineRoute } from "$lib/colectivos";
    import { setContext } from "svelte";

    let map;
    let routeLayout = L.polyline(L.latLng([0, 0]), { color: "red" });

    function createMap(container) {
        map = L.map(container);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        routeLayout.addTo(map);
    }

    function onLocationFound(e) {
        setMark({ latLng: e.latlng, popupText: "Tu ubicacion" });
    }
    async function setRoute(line) {
        const routePoints = await getLineRoute(line);
        const routePointsLatLngs = routePoints.map((point) => [
            point.Latitud,
            point.Longitud,
        ]);
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
