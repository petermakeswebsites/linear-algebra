<script lang="ts">
	import { Vec } from "$lib/calculations"
	import { newVec, setVec, vectors } from "$lib/vector-list"
	import VectorEditor from "./VectorEditor.svelte"
</script>
{#each $vectors as [id, vector] (id)}
    <VectorEditor {vector} {id} />
{/each}
<button on:click={() => newVec(Vec.fromNumberArray([1,1,1]))}>+ Add Vector</button>