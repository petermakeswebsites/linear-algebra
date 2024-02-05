<script lang="ts">
	import { Matrix, Vec } from '$lib/calculations'
	import {
		GlobalTransformMatrix,
		GlobalTransformShift,
		globalMatrixIsBeingOveridden,
		setGlobalTransformMatrix
	} from '$lib/global-transform'
	import { get } from 'svelte/store'

	$: numbers = $GlobalTransformMatrix.transpose.realNumberArray()
	function updateMatrix() {
		setGlobalTransformMatrix(Matrix.fromRealNumberArray(numbers, 3))
	}
</script>

<h2 class="text-lg">Global Matrix Modifier</h2>
Transition:<br />
<input
	type="range"
	min="0"
	step="0.001"
	max="1"
	bind:value={$GlobalTransformShift}
	class="slider w-full"
	width="100%"
/> <br />
{#if $GlobalTransformShift === 0}
	<span class="text-red-400"> Matrix transform not displayed because transition is 0 </span> <br />
{/if}
<div class="grid-cols-3 grid justify-center items-center text-center w-1/2 mx-auto mt-2">
	{#each numbers as number, i}
		<div class="flex justify-center w-full">
			<input
				class="appearance-none bg-transparent inline-block w-5"
				value={number}
				on:change={(evt) => {
					const num = +evt.target.value
					GlobalTransformMatrix.update((matrix) => {
						const d = matrix.transpose.setNumberInArray(i, num).transpose
						return d
					})
				}}
			/>
		</div>
	{/each}
</div>
{#if $globalMatrixIsBeingOveridden}<span class="text-red-400"
		>Matrix is being overridden in scripts</span
	>{/if}
<!-- Determinant: {$GlobalTransformMatrix.determinant.toString()} -->
