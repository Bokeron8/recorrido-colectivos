<script>
	import { getContext, onDestroy } from 'svelte';
	import Input from './Input.svelte';
	import { getLineData } from '$lib/colectivos';

	export let linesData;
	let lineStopsData = [];

	const { setRoute, setMark, setDriversMark } = getContext('map');

	let lineCode = '';
	let intervalId = null;

	function stopPolling() {
		clearInterval(intervalId);
		intervalId = null;
	}

	async function changeLine(line) {
		const found = linesData.find((x) => x.descripcion == line);
		if (!found) return;

		stopPolling();
		lineCode = found.codigoLinea;

		try {
			const { puntos, paradas } = await getLineData(lineCode);
			setRoute(puntos);
			lineStopsData = paradas;
		} catch (e) {
			console.error('[InputGroup] failed to load line data', e);
		}
	}

	function changeStop(stopDescription) {
		const stopData = lineStopsData.find((stop) => stopDescription == stop.descripcion);
		if (!stopData) return;

		setMark({
			latLng: [stopData.latitud, stopData.longitud],
			popupText: stopDescription
		});

		stopPolling();
		intervalId = setInterval(() => setDriversMark(lineCode, stopData.identificador), 1000 * 60);
	}

	onDestroy(stopPolling);
</script>

<div class="inputGroup">
	<Input placeholder="Nombre de la linea" unfilteredData={linesData} clickFunction={changeLine} />
	{#if lineStopsData.length > 0}
		<Input
			placeholder="Nombre de la parada"
			unfilteredData={lineStopsData}
			clickFunction={changeStop}
		/>
	{/if}
</div>

<style>
	.inputGroup {
		position: absolute;
		top: 0;
		right: 0%;
		z-index: 100;
		text-align: left;

		margin: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
