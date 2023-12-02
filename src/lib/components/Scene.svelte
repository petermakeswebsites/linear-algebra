<script lang="ts">
	import { T } from '@threlte/core'
	import {
		ContactShadows,
		Float,
		Grid,
		MeshLineGeometry,
		MeshLineMaterial,
		OrbitControls,
		Text
	} from '@threlte/extras'
	import { OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
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

	$: console.log($twoD)
	let fov = tweened($twoD ? 10 : 15)
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
	$: $fov = $twoD ? 10 : 15
	$: $position = $twoD ? [0, 0, 50] : [10, 10, 10]
</script>

<T is={PerspectiveCamera} makeDefault position={$position} fov={$fov}>
	<OrbitControls enabled={!$twoD} enableZoom={false} enableDamping target.y={0} />
</T>

<Vectors />
<T.DirectionalLight intensity={0.8} position.x={5} position.y={10} />

<!-- <EasyGrid /> -->
<T.AmbientLight intensity={0.2} />

<TriGrid transform={$GlobalTweenedMatrix} opacity={0.2} />
<TriGrid opacity={0.1} />
<!-- <Planes /> -->
<UnitVectors opacity={0.2} grayscale />

<UnitVectors transform={$GlobalTweenedMatrix} />

<ContactShadows scale={10} blur={2} far={2.5} opacity={0.5} />
<!-- <Float
  floatIntensity={1}
  floatingRange={[0, 1]}
>
  <T.Mesh
    position.y={1.2}
    position.z={-0.75}
  >
    <T.BoxGeometry />
    <T.MeshStandardMaterial color="#0059BA" />
  </T.Mesh>
</Float>

<Float
  floatIntensity={1}
  floatingRange={[0, 1]}
>
  <T.Mesh
    position={[1.2, 1.5, 0.75]}
    rotation.x={5}
    rotation.y={71}
  >
    <T.TorusKnotGeometry args={[0.5, 0.15, 100, 12, 2, 3]} />
    <T.MeshStandardMaterial color="#F85122" />
  </T.Mesh>
</Float>

<Float
  floatIntensity={1}
  floatingRange={[0, 1]}
>
  <T.Mesh
    position={[-1.4, 1.5, 0.75]}
    rotation={[-5, 128, 10]}
  >
    <T.IcosahedronGeometry />
    <T.MeshStandardMaterial color="#F8EBCE" />
  </T.Mesh>
</Float> -->
