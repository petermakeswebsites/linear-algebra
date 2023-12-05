<script lang="ts">
	import { T } from '@threlte/core'
	import type { Texture } from 'three'
	import Line from './helpers/Line.svelte'
	import { times } from 'lodash-es'
	import { Matrix, Vec } from '$lib/calculations'
	import { Num } from '$lib/complex'
	import { twoD } from '$lib/2d'

	export let size = 20
	export let spacing = 1
	export let color = '#ff0000'
    export let opacity = 0.2
    export let alphaMap : Texture | undefined = undefined

    export let transform : Matrix = Matrix.identity(3)

	export let plane: 'ij' | 'jk' | 'ki' = 'ki'

	function processLines() {
		const lines: [Vec, Vec][] = []
		for (let i = 0; i <= size; i++) {
			const start = 0 - size / 2
			const end = 0 + size / 2
			if (plane === 'ij') {
				lines.push([
					new Vec([new Num(start + i), new Num(start), new Num(0)]),
					new Vec([new Num(start + i), new Num(end), new Num(0)])
				])
				lines.push([
					new Vec([new Num(start), new Num(start + i), new Num(0)]),
					new Vec([new Num(end), new Num(start + i), new Num(0)])
				])
			} else if (plane === 'jk') {
				lines.push([
					new Vec([new Num(0), new Num(start + i), new Num(start)]),
					new Vec([new Num(0), new Num(start + i), new Num(end)])
				])
				lines.push([
					new Vec([new Num(0), new Num(start), new Num(start + i)]),
					new Vec([new Num(0), new Num(end), new Num(start + i)])
				])
			} else if (plane === 'ki') {
				lines.push([
					new Vec([new Num(start + i), new Num(0), new Num(start)]),
					new Vec([new Num(start + i), new Num(0), new Num(end)])
				])
				lines.push([
					new Vec([new Num(start), new Num(0), new Num(start + i)]),
					new Vec([new Num(end), new Num(0), new Num(start + i)])
				])
			} else {
				throw new Error('NOT IMPLE')
			}
		}
		return lines
	}

	const verticalLines = processLines()
    $: transformedLines = verticalLines.map(verticalLine => {
        const matrix = new Matrix(verticalLine)
        const updated = transform.times(matrix)
        return updated.vecs
    })
</script>

{#each transformedLines as verticalLine}
	<Line {alphaMap} points={verticalLine} {color} width={0.01} opacity={opacity} />
{/each}
<!-- <T.Mesh>
	<MeshLineGeometry  />
	<MeshLineMaterial width={0.04} {color} />
</T.Mesh> -->
