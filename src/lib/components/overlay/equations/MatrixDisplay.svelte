<script lang="ts">
	import type { Matrix } from "$lib/calculations"
	import { repeat } from "lodash-es"
	import { GridHelper } from "three"

export let mtx : Matrix
</script>
<div class="border-blue-300 inline-grid border-l px-2 border-r gap-y-0 py-0 gap-1 items-center justify-center" style:grid-template-columns={repeat("1fr ", mtx.cols)}>
    {#each mtx.numberArray() as num}
    <div class="items-center justify-center flex">
        {num.toString()}
    </div>
    {/each}
</div>