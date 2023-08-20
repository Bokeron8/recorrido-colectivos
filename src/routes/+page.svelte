<script>
    import L, { marker } from "leaflet";

    let map;
    let driverMarkers = [];
    var linea = "132";
    let lineas = [];
    let inputValue = "";
    let identificadorParada = "CT31844";
    let paradas = [];
    let inputParadas = "";
    let filteredParadas = [];
    let filteredlineas = [];
    var routeLayout;
    var paradaLayout;
    function createMap(container) {
        console.log();
        map = L.map(container);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        routeLayout = L.polyline([], { color: "red" }).addTo(map);
        paradaLayout = L.marker(L.latLng(0, 0)).addTo(map);

        return map;
    }
    function onLocationFound(e) {
        L.marker(e.latlng).addTo(map).bindPopup("Tu ubicacion");
    }
    function getStopPointsByLine(linea) {
        fetch(`/api/get-stop-points?linea=${linea}`)
            .then((response) => response.json())
            .then((data) => {
                paradas = data.lineas;
            });
    }

    function setDriverPoint(linea, parada) {
        fetch(`/api/get-arrives?linea=${linea}&parada=${parada}`)
            .then((response) => response.json())
            .then((data) => {
                const arribos = data.arribos;

                if (driverMarkers.length > 0) {
                    arribos
                        .splice(0, driverMarkers.length - 1)
                        .forEach((arribo, i) => {
                            var latLng = L.latLng(
                                arribo.Latitud,
                                arribo.Longitud
                            );
                            driverMarkers[i].setLatLng(latLng);
                            driverMarkers[i].bindPopup(arribo.Arribo);
                        });
                } else {
                    driverMarkers = arribos.map((arribo, index, arr) => {
                        if (
                            index ===
                            arr.indexOf(
                                arr.find(
                                    (x) =>
                                        x.IdentificadorCoche ==
                                        arribo.IdentificadorCoche
                                )
                            )
                        ) {
                            var target = L.latLng(
                                arribo.Latitud,
                                arribo.Longitud
                            );
                            // Place a marker on the same location.
                            return L.marker(target)
                                .addTo(map)
                                .bindPopup(arribo.Arribo);
                        }
                    });
                }
            });
    }
    function setParada(parada) {
        identificadorParada = parada.Identificador;
        var target = L.latLng(parada.Latitud, parada.Longitud);
        paradaLayout.setLatLng(target).bindPopup(parada.Descripcion);

        map.setView(target, 17);
    }
    function setRoute(linea) {
        fetch(`/api/get-route?linea=${linea}`)
            .then((response) => response.json())
            .then((data) => {
                const points = data.puntos;
                const latlngs = points.map((point) => [
                    point.Latitud,
                    point.Longitud,
                ]);

                routeLayout.setLatLngs(latlngs).addTo(map);
                map.fitBounds(routeLayout.getBounds());
            });
    }

    function mapAction(container) {
        map = createMap(container);
        map.on("locationfound", onLocationFound);
        map.locate();

        setRoute(linea);
        getStopPointsByLine(linea);

        setInterval(() => setDriverPoint(linea, identificadorParada), 5000);
    }

    function lineasAction() {
        fetch("/api/get-lines")
            .then((response) => response.json())
            .then((data) => {
                lineas = data.lineas;
            });
    }

    function filterlineas() {
        let storageArr = [];
        if (inputValue) {
            lineas.forEach((linea) => {
                if (
                    linea.Descripcion.toLowerCase().startsWith(
                        inputValue.toLowerCase()
                    )
                ) {
                    storageArr = [...storageArr, linea.Descripcion];
                }
            });
        }
        filteredlineas = storageArr;
    }

    function changeLinea(line) {
        inputValue = "";
        filterlineas();
        driverMarkers.forEach((mark) => {
            mark.remove();
        });
        driverMarkers = [];
        linea = lineas.find((x) => x.Descripcion == line).CodigoLineaParada;
        setRoute(linea);
        getStopPointsByLine(linea);
    }
    function filterParadas() {
        let storageArr = [];
        if (inputParadas) {
            paradas.forEach((parada) => {
                if (
                    parada.Descripcion.toLowerCase().includes(
                        inputParadas.toLowerCase()
                    )
                ) {
                    storageArr = [...storageArr, parada.Descripcion];
                }
            });
        }
        filteredParadas = storageArr;
    }
    function changeParada(parada) {
        inputParadas = "";
        filterParadas();
        parada = paradas.find((x) => x.Descripcion == parada);
        setParada(parada);
    }
</script>

<link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
/>
<div style="position:relative;height:100%;">
    <div style="height:100%;width:100%;z-index: 1;" use:mapAction />
    <div class="inputGroup" use:lineasAction>
        <div class="inputContainer">
            <input
                type="text"
                placeholder="Ej: 103A"
                style="background-color:white;padding:10px;border:black 2px solid;"
                bind:value={inputValue}
                on:input={filterlineas}
            />
            {#if filteredlineas.length > 0}
                <ul style="list-style: none;">
                    {#each filteredlineas as line}
                        <li style="width: 100%;">
                            <a
                                href="#"
                                on:click={() => changeLinea(line)}
                                class="filteredItems">{line}</a
                            >
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
        <div class="inputContainer">
            <input
                type="text"
                placeholder="Ej: Santa Fe-Belgrano"
                style="background-color:white;padding:10px;border:black 2px solid;"
                bind:value={inputParadas}
                on:input={filterParadas}
            />
            {#if filteredParadas.length > 0}
                <ul style="list-style: none;">
                    {#each filteredParadas as parada}
                        <li style="width: 100%;">
                            <a
                                href="#"
                                on:click={() => changeParada(parada)}
                                class="filteredItems">{parada}</a
                            >
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>

<style>
    input:focus {
        outline: none;
    }
    .inputGroup {
        position: absolute;
        top: 0;
        right: 0%;
        z-index: 100;
        text-align: left;
        /* background-color: rgba(255, 255, 255, 0.8); */
        margin: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .inputContainer {
        display: flex;
        flex-direction: column;
        background-color: white;
    }
    .filteredItems {
        text-decoration: none;
        color: black;
        display: block;
        width: 100%;
        padding: 10px;
        border: solid black 2px;
        border-top: none;
    }
    .filteredItems:hover {
        background-color: rgb(0, 162, 255);
        cursor: pointer;
    }
</style>
