<script>
	import { setContext } from 'svelte';
	import L from '$lib/map/leaflet';
	import { busIcon } from '$lib/map/icon';
	import { arrowWings, groupPointsByFlag } from '$lib/map/geometry';
	import { getArrives, getLineRoute, getNearestStops } from '$lib/colectivos';
	import {
		IGNORED_ROUTE_FLAGS,
		ROUTE_COLORS,
		TILE_ATTRIBUTION,
		TILE_MAX_ZOOM,
		TILE_URL
	} from '$lib/config';

	let map;
	const layer = L.featureGroup();

	function createMap(container) {
		map = L.map(container);
		L.tileLayer(TILE_URL, { maxZoom: TILE_MAX_ZOOM, attribution: TILE_ATTRIBUTION }).addTo(map);
		layer.addTo(map);
	}

	function onMapClicked(e) {
		getNearestStops(e.latlng.lat, e.latlng.lng).then((stops) => {
			stops.forEach((stop) =>
				setMark({
					latLng: [stop.latitud, stop.longitud],
					popupText: stop.lineas
				})
			);
		});
	}

	function onLocationFound(e) {
		setMark({ latLng: e.latlng, popupText: 'Tu ubicacion' });
		map.setView(e.latlng, 17);
	}

	function drawArrow(tail, tip, color) {
		const [leftWing, rightWing] = arrowWings(tip, tail);
		L.polyline([leftWing, tip, rightWing], { color }).addTo(layer);
	}

	async function setRoute(line) {
		const routePoints = await getLineRoute(line);
		const routes = groupPointsByFlag(routePoints, IGNORED_ROUTE_FLAGS);
		if (routes.length === 0) return;

		layer.clearLayers();
		routes.forEach((points, i) => {
			const color = ROUTE_COLORS[i % ROUTE_COLORS.length];
			L.polyline(points, { color }).addTo(layer);
			points.forEach((point, idx) => {
				if (idx > 0 && idx % 2 === 0) drawArrow(points[idx - 1], point, color);
			});
		});

		map.fitBounds(layer.getBounds());
	}

	function setMark({ latLng, popupText, options }) {
		return L.marker(latLng, options).addTo(map).bindPopup(popupText);
	}

	let driversMark = [];

	function clearDrivers() {
		driversMark.forEach((mark) => mark.remove());
		driversMark = [];
	}

	async function setDriversMark(line, stop) {
		const arrives = (await getArrives(line, stop)).reverse();

		if (arrives.length === 0) {
			clearDrivers();
			return;
		}

		if (driversMark.length !== arrives.length) {
			clearDrivers();
			driversMark = arrives.map((arrive) =>
				setMark({
					latLng: [arrive.latitud, arrive.longitud],
					popupText: arrive.descripcion,
					options: { icon: busIcon }
				})
			);
			return;
		}

		driversMark.forEach((mark, i) => {
			mark
				.setLatLng([arrives[i].latitud, arrives[i].longitud])
				.setPopupContent(arrives[i].descripcion);
		});
	}

	function mapAction(container) {
		createMap(container);
		map.on('locationfound', onLocationFound);
		map.on('click', onMapClicked);
		map.locate();
	}

	setContext('map', { setRoute, setMark, setDriversMark });
</script>

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
