<script>
    import { filterData } from "$lib/filter";

    let inputValue = "";
    let filteredData = [];
    export let placeholder;
    export let unfilteredData;
    export let clickFunction;
</script>

<div class="inputContainer">
    <input
        type="text"
        {placeholder}
        bind:value={inputValue}
        on:input={() =>
            (filteredData = filterData({ inputValue, unfilteredData }))}
    />
    {#if filteredData.length > 0}
        <ul>
            {#each filteredData as data}
                <li style="width: 100%;">
                    <a
                        href="#"
                        class="filteredItems"
                        on:click={() => clickFunction(data)}>{data}</a
                    >
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    input {
        background-color: white;
        padding: 10px;
        border: black 2px solid;
    }
    input:focus {
        outline: none;
    }
    ul {
        list-style: none;
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
