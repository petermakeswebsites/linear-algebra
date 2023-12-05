<script lang="ts">
	import { Vec } from '$lib/calculations'
	import { writable } from 'svelte/store'
	import Vector from './helpers/Vector.svelte'
	import { GlobalTweenedMatrix } from '$lib/global-transform'
	import { vectors } from '$lib/vector-list'
	import { eqResults } from '$lib/equations'
	import { colorFromString } from '$lib/colors'
	import { Num } from '$lib/complex'
	import { ConsoleEigenvector, consoleEntries } from '$lib/console'

    $: vecs = [...$eqResults.vecs].filter(([_, vec]) => vec.dimensions == 3)
    $: twodvecs = [...$eqResults.vecs].filter(([_, vec]) => vec.dimensions == 2).map(([id, vec]) => ([id, new Vec([...vec.values, new Num()])] as const))

	$: extraVecs = $consoleEntries.flatMap((line) => {
		if (line instanceof ConsoleEigenvector) {
			const rtn = []
			if (line.vec1) rtn.push(['Eigen 1', line.vec1.toThreeDimensions] as const)
			if (line.vec2) rtn.push(['Eigen 2', line.vec2.toThreeDimensions] as const)
			return rtn
		}
		return []
	})

	$: console.log(extraVecs)

</script>

{#each $vectors as [id, { destination }] (id)}
	<Vector color={colorFromString(id)} text={id} destination={$GlobalTweenedMatrix.times(destination.toMatrix()).toVec()} />
{/each}
{#each [...vecs, ...twodvecs] as [id, vec] (id)}
	<Vector fontSize={0.2} color={colorFromString(id)}   text={id} destination={$GlobalTweenedMatrix.times(vec.toMatrix()).toVec()} />
{/each}
{#each [...extraVecs] as [id, vec] (id)}
	<Vector fontSize={0.2} color={colorFromString(id)}   text={id} destination={$GlobalTweenedMatrix.times(vec.toMatrix()).toVec()} />
{/each}
