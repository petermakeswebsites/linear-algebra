<script lang="ts">
	import Line from './Line.svelte'
	import { Vec } from '$lib/calculations'
	import { T } from '@threlte/core'
	import HoverBall from './HoverBall.svelte'
	export let color = '#f0f0ff'
	export let destination: Vec
    export let text = ""
    export let fontSize = 0.2
	export let interactive = true
	// $: vec = new Vector3(...destination)


	
</script>

<Line points={[Vec.Zero(3), destination]} {color} {text} {fontSize} />
<T.Mesh
position={destination.toRealArray()}>
	<T.SphereGeometry args={[0.05, 10, 10]} />
	<T.MeshBasicMaterial {color} />
</T.Mesh>
{#if interactive}
	<HoverBall {color} point={destination.toRealArray()} />
{/if}
