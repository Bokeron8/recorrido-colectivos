<script>
	import { filterData } from '$lib/filter';

	export let placeholder;
	export let unfilteredData;
	export let clickFunction;

	let inputValue = '';
	let filteredData = [];
	let selectedItem = null;
	let inputElement;
	let focus = false;

	function onBlur(e) {
		focus = false;
		if (e.relatedTarget?.tagName === 'BUTTON') e.relatedTarget.click();
	}

	function selectItem(data) {
		if (!data) return;
		inputValue = data;
		clickFunction(data);
		filteredData = [];
		selectedItem = null;
	}

	function onKeyDown(e) {
		if (e.target !== inputElement) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedItem =
				selectedItem === null || selectedItem >= filteredData.length - 1 ? 0 : selectedItem + 1;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedItem =
				selectedItem === null || selectedItem <= 0 ? filteredData.length - 1 : selectedItem - 1;
		} else if (e.key === 'Enter' && filteredData.length > 0) {
			selectItem(filteredData[selectedItem ?? 0]);
		}
	}

	function handleTextInput() {
		filteredData = filterData({ inputValue, unfilteredData });
		selectedItem = 0;
	}
</script>

<svelte:window on:keydown={onKeyDown} />
<div class="inputContainer">
	<input
		type="text"
		{placeholder}
		aria-label={placeholder}
		on:focus={() => (focus = true)}
		on:blur={onBlur}
		bind:value={inputValue}
		bind:this={inputElement}
		on:input={handleTextInput}
	/>
	{#if filteredData.length > 0 && focus}
		<ul>
			{#each filteredData as data, i}
				<li>
					<button
						type="button"
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
