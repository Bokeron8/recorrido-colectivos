<script>
    import { filterData } from "$lib/filter";

    let inputValue = "";
    let filteredData = [];
    let inputElement;
    export let placeholder;
    export let unfilteredData;
    export let clickFunction;
    let focus;

    function onBlur(e) {
        focus = false;
        if(e.relatedTarget !== null){
            if (e.relatedTarget.tagName == "BUTTON") e.relatedTarget.click();
        }
    }
    function selectItem(data) {
        inputValue = data;
        clickFunction(data);
        filteredData = [];
        selectedItem = null;
    }

    let selectedItem = null;

    function on_key_down(e) {
        if (e.target == inputElement) {
            if (e.key === "ArrowDown") {
                if (selectedItem == filteredData.length - 1) {
                    selectedItem = 0;
                } else if (selectedItem <= filteredData.length - 1) {
                    selectedItem === null
                        ? (selectedItem = 0)
                        : (selectedItem += 1);
                }
            } else if (e.key === "ArrowUp" && selectedItem !== null) {
                selectedItem === 0
                    ? (selectedItem = filteredData.length - 1)
                    : (selectedItem -= 1);
            } else if (e.key === "Enter") {
                selectItem(filteredData[selectedItem]);
            } else {
                return;
            }
        }
    }
    function handleTextInput() {
        filteredData = filterData({ inputValue, unfilteredData });
        selectedItem = 0;
    }
</script>

<svelte:window on:keydown={on_key_down} />
<div class="inputContainer">
    <input
        type="text"
        {placeholder}
        on:focus={() => (focus = true)}
        on:blur={onBlur}
        bind:value={inputValue}
        bind:this={inputElement}
        on:input={() => handleTextInput()}
    />
    {#if filteredData.length > 0 && focus}
        <ul>
            {#each filteredData as data, i}
                <li style="width: 100%;">
                    <button
                        class="filteredItems"
                        class:filteredItems-active={selectedItem == i}
                        on:click={() => selectItem(data)}>{data}</button
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
        font-size: inherit;
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

        font-size: 16px;
    }
    .filteredItems {
        text-align: left;
        background-color: inherit;
        color: black;
        width: 100%;
        padding: 10px;
        border: solid black 2px;
        border-top: none;
    }
    .filteredItems:hover,
    .filteredItems-active {
        background-color: rgb(0, 162, 255);
        cursor: pointer;
    }
</style>
