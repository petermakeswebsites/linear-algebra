<script lang="ts">
	import { Matrix, Vec } from "$lib/calculations"
	import { GlobalTransformMatrix, GlobalTransformShift, setGlobalTransformMatrix } from "$lib/global-transform"
	import { get } from "svelte/store"


    $: numbers = $GlobalTransformMatrix.transpose.realNumberArray()
    function updateMatrix() {
        setGlobalTransformMatrix(Matrix.fromRealNumberArray(numbers, 3))
    }

</script>
<h2>Global Matrix Modifier</h2>
Transition:
    <input type="range" min="0" step="0.001" max="1" bind:value={$GlobalTransformShift} class="slider" width="100%"> <br />
{#each numbers as number, i}
    <input class="appearance-none bg-transparent inline-block w-5" value={number} on:change={(evt) => {
        const num = +evt.target.value
        GlobalTransformMatrix.update(matrix => {
            const d = matrix.transpose.setNumberInArray(i, num).transpose
            return d
        })
    }}> ...
    {#if i % 3 === 2}
    <br />
    {/if}
{/each}
<br />
Determinant: {$GlobalTransformMatrix.determinant.toString()}
