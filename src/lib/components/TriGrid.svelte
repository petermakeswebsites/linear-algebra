<script lang="ts">
	import { twoD } from '$lib/2d'
	import { Matrix, Vec } from '$lib/calculations'
	import EasyGrid from './EasyGrid.svelte'
	import { fadedTexture } from '$lib/faded-texture'
	import { times } from 'lodash-es'
	import Line from './helpers/Line.svelte'
	export let opacity = 0.1
	export let transform = Matrix.identity(3)
	export let grayscale = false
</script>

<EasyGrid
	alphaMap={fadedTexture}
	plane="ij"
	color={grayscale ? '#ffffff' : '#ffff00'}
	{transform}
	{opacity}
/>
<!-- <Line points={[Vec.fromNumberArray([-20,0,0]),Vec.fromNumberArray([20,0,0])]} color={grayscale ? '#ffffff' : '#ff00ff'} width={0.01} opacity={1} /> -->
<!-- <Line points={[Vec.fromNumberArray([0,-20,0]),Vec.fromNumberArray([0,-20,0])]} color={grayscale ? '#ffffff' : '#ff00ff'} width={0.01} opacity={1} /> -->
<!-- <Line points={[Vec.fromNumberArray([0,0,-20]),Vec.fromNumberArray([0,0,20])]} color={grayscale ? '#ffffff' : '#ff00ff'} width={0.01} opacity={1} /> -->
{#if !$twoD}
	<EasyGrid
		alphaMap={fadedTexture}
		plane="ki"
		color={grayscale ? '#ffffff' : '#ff00ff'}
		{transform}
		{opacity}
	/>
	<EasyGrid
		alphaMap={fadedTexture}
		plane="jk"
		color={grayscale ? '#ffffff' : '#00ffff'}
		{transform}
		{opacity}
	/>
{/if}
