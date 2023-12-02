<script lang="ts">
	import { eqError, equations } from "$lib/equations"

</script>
<textarea class=" bg-blue-900 p-1 rounded-md w-full h-96" bind:value={$equations}></textarea>
{#if $eqError}
    {$eqError}
{/if}