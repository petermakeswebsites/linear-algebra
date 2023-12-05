<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core'
	import {
		OrbitControls,
	} from '@threlte/extras'
	import { Fog, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
	import Line from './helpers/Line.svelte'
	import { Matrix, Vec } from '$lib/calculations'
	import Vectors from './Vectors.svelte'
	import UnitVectors from './helpers/UnitVectors.svelte'
	import { GlobalTweenedMatrix } from '$lib/global-transform'
	import Planes from './Planes.svelte'
	import EasyGrid from './EasyGrid.svelte'
	import TriGrid from './TriGrid.svelte'
	import { twoD } from '$lib/2d'
	import { tweened } from 'svelte/motion'
	import { zipWith } from 'lodash-es'
	import { cubicInOut } from 'svelte/easing'
	import { onMount } from 'svelte'
	import { eqResults } from '$lib/equations'
	import Camera from './Camera.svelte'

	const { autoRenderTask, scheduler, advance, scene } = useThrelte()

	//
	// Render using mode
	//

	// $: {
	// 	$GlobalTweenedMatrix; $eqResults;
	// 	advance()
	// }

	onMount(() => {
		setTimeout(() => {
			console.log(JSON.stringify(scheduler.getSchedule(), null, 2))
		}, 500)
	})
	useTask(
		() => {
			console.log('rendered')
		},
		{ after: autoRenderTask, autoInvalidate: false }
	)

	//@ts-ignore
	globalThis.advance = advance

	// scene.fog = new Fog('black', 1.5, 2)
</script>
<Camera />

<Vectors />
<!-- <T.DirectionalLight intensity={0.8} position.x={5} position.y={10} /> -->

<!-- <EasyGrid /> -->
<!-- <T.AmbientLight intensity={0.2} /> -->

<TriGrid transform={$GlobalTweenedMatrix} opacity={0.2} />
<TriGrid opacity={0.2} />
<!-- <Planes /> -->
<UnitVectors opacity={0.2} grayscale />

<UnitVectors transform={$GlobalTweenedMatrix} />
