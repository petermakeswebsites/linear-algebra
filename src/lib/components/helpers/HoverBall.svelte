<script lang="ts">
	import { T } from '@threlte/core'
	import { interactivity } from '@threlte/extras'
	export let point: number[]
	export let color = '#eeeeee'
	interactivity()
</script>

<T.Mesh
	on:pointerup={(e) => console.log('up')}
	on:pointerdown={(e) => console.log('down')}
	on:pointerover={(e) => console.log('over')}
	on:pointerout={(e) => console.log('out')}
	on:pointerenter={(e) => console.log('enter')}
	on:pointerleave={(e) => console.log('leave')}
	on:pointermove={(e) => console.log('move')}
	position={point}
>
	<T.SphereGeometry args={[0.1, 20, 20]} />
	<T.MeshBasicMaterial {color} transparent opacity={0.5} />
</T.Mesh>
