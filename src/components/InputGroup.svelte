<script>
    import Input from "./Input.svelte";
    import { getContext } from "svelte";
    import { getStopPointsByLine } from "$lib/colectivos";

    export let linesData;
    let lineStopsData = [];

    const mapCtx = getContext("map");

    const setRoute = mapCtx.setRoute;
    const setMark = mapCtx.setMark;
    const setDriversMark = mapCtx.setDriversMark;

    let lineCode = "";
    async function changeLine(line) {
        lineCode = linesData.find(
            (x) => x.Descripcion == line
        ).CodigoLineaParada;
        setRoute(lineCode);
        lineStopsData = await getStopPointsByLine(lineCode);
    }
    let intervalId = null;
    function changeStop(stopDescription) {
        const stopData = lineStopsData.find(
            (stop) => stopDescription == stop.Descripcion
        );
        setMark({
            latLng: [stopData.Latitud, stopData.Longitud],
            popupText: stopDescription,
        });
        clearInterval(intervalId);
        intervalId = setInterval(
            () => setDriversMark(lineCode, stopData.Identificador),
            5000
        );
    }
</script>

<div class="inputGroup">
    <Input
        placeholder="Nombre de la linea"
        unfilteredData={linesData}
        clickFunction={changeLine}
    />
    {#if lineStopsData.length > 0}
        <Input
            placeholder="Nombre de las calles"
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
