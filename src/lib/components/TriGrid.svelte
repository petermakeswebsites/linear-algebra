<script lang="ts">
	import { twoD } from '$lib/2d'
	import { Matrix } from '$lib/calculations'
	import { useTexture } from '@threlte/extras'
	import EasyGrid from './EasyGrid.svelte'
	import { fadedTexture } from '$lib/faded-texture'
	export let opacity = 0.2
	export let transform = Matrix.identity(3)
    export let grayscale = false
</script>

<!-- {#if !$twoD} -->
<EasyGrid alphaMap={fadedTexture} plane="ki" color={grayscale ? '#ffffff' : "#ff00ff"} {transform} {opacity} />
<!-- {/if} -->
<EasyGrid alphaMap={fadedTexture}  plane="ij" color={grayscale ? '#ffffff' : "#ffff00"} {transform} {opacity} />
<EasyGrid alphaMap={fadedTexture}  plane="jk" color={grayscale ? '#ffffff' : "#00ffff"} {transform} {opacity} />
