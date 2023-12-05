<script lang="ts">
	import { twoD } from '$lib/2d'
	import { Matrix, Vec } from '$lib/calculations'
	import Line from './Line.svelte'
	export let opacity = 1
	export let grayscale = false
	export let transform = Matrix.identity(3)
</script>

<Line
	text={'i'}
	{opacity}
	points={[Vec.Zero(3), transform.times(Vec.fromNumberArray([1, 0, 0]).toMatrix()).toVec()]}
	color={grayscale ? '#ffffff' : '#fe3d00'}
/>
<Line
	text={'j'}
	{opacity}
	points={[Vec.Zero(3), transform.times(Vec.fromNumberArray([0, 1, 0]).toMatrix()).toVec()]}
	color={grayscale ? '#ffffff' : '#3dfe00'}
/>
{#if !$twoD}
	<Line
		text={'k'}
		{opacity}
		points={[Vec.Zero(3), transform.times(Vec.fromNumberArray([0, 0, 1]).toMatrix()).toVec()]}
		color={grayscale ? '#ffffff' : '#003dfe'}
	/>
{/if}
