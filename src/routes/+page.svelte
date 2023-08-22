<script>
    import Map from "../components/Map.svelte";
    import InputGroup from "../components/InputGroup.svelte";
    /** @type {import('./$types').PageData} */
    export let data;
    const { linesData } = data;
</script>

<main style="height:100%;">
    <Map>
        <InputGroup {linesData} />
    </Map>
</main>

<style>
</style>
