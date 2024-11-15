<script>
    import L from "leaflet";
    import {
        getLineRoute,
        getNearestStops,
        getArrives,
        myIcon,
    } from "$lib/colectivos";
    import { setContext } from "svelte";

    let map;
    let userLocation;
    let layer = L.featureGroup();

    function createMap(container) {
        map = L.map(container);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(map);
        
        layer.addTo(map);
        
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
        setMark({
            latLng: e.latlng,
            popupText: "Tu ubicacion",
        });
        map.setView(e.latlng, 17);
        userLocation = e.latlng;
    }
    /*
        a b = angle
        c b = angle
        angle 
    */
    function calculateAngle(p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    // Calculamos el ángulo en radianes usando atan2
    const angle = Math.atan2(y2 - y1, x2 - x1);  // Ángulo entre los dos puntos
    const angleDegrees = angle * (180 / Math.PI);  // Convertimos de radianes a grados

    // Normalizamos el ángulo a [0, 360]
    return (angleDegrees + 360) % 360;
}

    function addArrow(tailOfArrow, tipOfArrow, color="black"){
        let angle = calculateAngle(tailOfArrow, tipOfArrow);
        const leftAngle = angle - 145
        const rightAngle = angle + 145
        const wingLength = 0.00045;

        const [lat, lon] = [...tipOfArrow]

        const leftAngleRad = leftAngle * Math.PI / 180;
        const rightAngleRad = rightAngle * Math.PI / 180;

        const leftWing = {
            lat: lat + wingLength * Math.cos(leftAngleRad),
            lon: lon + wingLength * Math.sin(leftAngleRad)
        };


        const rightWing = {
            lat: lat + wingLength * Math.cos(rightAngleRad),
            lon: lon + wingLength * Math.sin(rightAngleRad)
        };

        const arrow = L.polyline([[leftWing.lat, leftWing.lon],tipOfArrow, [rightWing.lat, rightWing.lon]], { color: color});    
        arrow.addTo(layer);
    }
    async function setRoute(line) {
        /* 
        En realidad no son rutas innecesarias es que una misma linea puede tener mas de un recorrido
        Ej: 105C, tiene un recorrido en el que va hasta una parte de la ruta 12 y da media vuelta,
        y otro en el que va hasta el pericho y recien ahi regresa, pero para simplificar mi trabajo
        voy a elegir mostrar la ruta mas extensa
        */
        const rutasInnecesarias = ["ESCE", "MUDA", "MOCH", "PEPU", "PUVI", "I-17PUERTO", "I-ESDR", "V-DRES", "I-VIPU", "I-PEPU"];
        const routePoints = await getLineRoute(line);

        const filteredRoutePoints = routePoints
            .filter(
                (point) =>
                    !rutasInnecesarias.some(
                        (v) => point.AbreviaturaBanderaSMP === v
                    )
            )
        let currentAbreviatura = filteredRoutePoints[0].AbreviaturaBanderaSMP;
        let currentRoutePoints = [];
        const routes = []
        layer.clearLayers();
        filteredRoutePoints.filter((point) => {
            if (point.AbreviaturaBanderaSMP !== currentAbreviatura) {
                routes.push(currentRoutePoints)
                currentAbreviatura = point.AbreviaturaBanderaSMP;
                currentRoutePoints = [];
            }
            currentRoutePoints.push([point.Latitud, point.Longitud])
        })
        routes.push(currentRoutePoints)

        const colors = ["red", "green", "blue", "yellow"]
        let i = 0;
        routes.forEach((route) => {
            const routeLayout = L.polyline(route, { color: colors[i] });
            let pointBefore = [];  
            routeLayout.addTo(layer);
            route.forEach((point, idx) => {
                if(pointBefore.length > 0 && !(idx % 2)){
                    addArrow(pointBefore, point, colors[i])
                }
                pointBefore = point
            })
            i++;
        })

        map.fitBounds(layer.getBounds())
    }
    function setMark({ latLng, popupText, options }) {
        return L.marker(latLng, options).addTo(map).bindPopup(popupText);
    }
    let driversMark = [];
    async function setDriversMark(line, stop) {
        let arrives = await getArrives(line, stop);
        arrives = arrives.reverse();
        if (arrives.length > 0) {
            if (driversMark.length == 0) {
                arrives.forEach((arrive) => {
                    const mark = setMark({
                        latLng: [arrive.Latitud, arrive.Longitud],
                        popupText: arrive.Arribo,
                        options: { icon: myIcon },
                    });
                    driversMark.push(mark);
                });
            } else {
                driversMark.forEach((mark, i) => {
                    mark.setLatLng([
                        arrives[i].Latitud,
                        arrives[i].Longitud,
                    ]).setPopupContent(arrives[i].Arribo);
                });
            }
        } else {
            driversMark.forEach((mark) => {
                mark.remove();
            });
            driversMark = [];
        }
    }
    function mapAction(container) {
        createMap(container);
        map.on("locationfound", onLocationFound);
        map.on("click", onMapClicked);
        map.locate();
    }

    setContext("map", { setRoute, setMark, setDriversMark });
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
