<script lang="ts" >
	import { suppressGlobalTweeningDelay } from "$lib/global-transform"
	import { slider } from "$lib/sliders"
</script>
Custom Slider:
<div class="text-sm">
    (use variable <i class="font-bold">slider</i> in script, ranges from 0 to 1): 
</div>
<input type="range" min="0" on:mousedown={() => $suppressGlobalTweeningDelay = true} on:mouseup={() => $suppressGlobalTweeningDelay = false} step="0.001" max="1" bind:value={$slider} class="slider w-full" width="100%"> <br />