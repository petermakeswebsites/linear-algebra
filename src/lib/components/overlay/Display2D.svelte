<script lang="ts">
	import { twoD } from "$lib/2d"

    
</script>
<button class="rounded-md px-2 py-1 mb-2 bg-blue-800" on:click={() => $twoD = !$twoD}> Switch to {$twoD ? "3D" : "2D"} Mode </button>