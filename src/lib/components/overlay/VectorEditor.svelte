<script lang="ts">
	import { Vec } from '$lib/calculations'
	import { setVec, type DisplayVector } from '$lib/vector-list'

	export let id: string
	export let vector: DisplayVector

	let i: HTMLInputElement
	let j: HTMLInputElement
	let k: HTMLInputElement

	function update() {
		setVec(id, Vec.fromNumberArray([+i.value, +j.value, +k.value]))
	}
</script>

<div>
	{id}:<br />
	<input
		bind:this={i}
		class="appearance-none bg-transparent inline-block w-8"
		on:change={update}
		value={vector.destination.i}
		type="number"
	/>i ...
	<input
		bind:this={j}
		class="appearance-none bg-transparent inline-block w-8"
		on:change={update}
		value={vector.destination.j}
		type="number"
	/>j ...
	<input
		bind:this={k}
		class="appearance-none bg-transparent inline-block w-8"
		on:change={update}
		value={vector.destination.k}
		type="number"
	/>k
</div>
