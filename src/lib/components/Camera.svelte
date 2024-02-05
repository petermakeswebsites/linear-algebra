<script>
	import { twoD } from '$lib/2d'
	import { isChanging } from '$lib/is-changing'
	import { T } from '@threlte/core'
	import { OrbitControls } from '@threlte/extras'
	import { zipWith } from 'lodash-es'
	import { cubicInOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'

	import { MOUSE, PerspectiveCamera } from 'three'

	$: console.log($twoD)

	let fov = tweened($twoD ? 10 : 15)
	$: $fov = $twoD ? 10 : 15

	let position = tweened($twoD ? [0, 0, 50] : [10, 10, 10], {
		interpolate(a, b) {
			return (t) => {
				return zipWith(a, b, (original, end) => {
					const asd = original + t * (end - original)
					return asd
				})
			}
		},
		easing: cubicInOut
	})

	$: $position = $twoD ? [0, 0, 50] : [10, 10, 10]

	const tweening = isChanging(position)

	$: mouseButtons = $twoD
		? {
				LEFT: MOUSE.PAN,
				MIDDLE: MOUSE.PAN,
				RIGHT: MOUSE.PAN
		  }
		: {
				LEFT: MOUSE.ROTATE,
				MIDDLE: MOUSE.DOLLY,
				RIGHT: MOUSE.PAN
		  }
</script>

<T is={PerspectiveCamera} makeDefault position={$position} fov={$fov}>
	<OrbitControls
    {mouseButtons}
		enableRotate={!$twoD}
		enablePan={true}
		enableZoom={true}
		minDistance={1}
		enableDamping={$tweening}
		target.y={0}
	/>
</T>
