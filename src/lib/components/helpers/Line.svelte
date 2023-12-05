<script lang="ts">
	import { Vec } from '$lib/calculations'
	import { T } from '@threlte/core'
	import { MeshLineGeometry, MeshLineMaterial, Text } from '@threlte/extras'
	import { Vector3, type ColorRepresentation, AdditiveBlending, Texture,  } from 'three'
	export let points: Vec[]
	export let color: ColorRepresentation | undefined
	export let text: string = ''
    export let width = 0.04
    export let fontSize = 0.2
    export let opacity = 1
    export let alphaMap : Texture | undefined = undefined

</script>

{#if text.length}
	<Text position={points[1].add(Vec.fromNumberArray([0,0.06,0])).toRealArray()} {fontSize} anchorX={'center'} anchorY={'bottom'} {text} {color}  />
{/if}
<T.Mesh>
	<MeshLineGeometry points={points.map((p) => new Vector3(...p.toRealArray()))} />
	<MeshLineMaterial {alphaMap} depthTest={false} transparent {opacity} {width} {color} blending={AdditiveBlending} />
    <!-- <MeshLineMaterial /> -->
</T.Mesh>
