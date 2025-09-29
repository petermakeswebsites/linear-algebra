<script lang="ts">
	import { T } from '@threlte/core'
	import { MeshLineMaterial } from '@threlte/extras'
	import {
		BackSide,
		BufferAttribute,
		BufferGeometry,
		DoubleSide,
		Float32BufferAttribute,
		Mesh,
		MeshBasicMaterial,
		SphereGeometry,
		Vector3
	} from 'three'

	export let calculateZ: (x: number, y: number) => number = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y,2))

	// Setup geometry and material
	// const geometry = new SphereGeometry(5, 10, 10) //new BufferGeometry()
	const geometry = new BufferGeometry() //new BufferGeometry()
	const material = new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide, wireframe: true })

	// const positions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	// const indices: number[] = [0, 1, 2]

	// geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
	// geometry.setIndex(indices)

    const squares = 20
    const density = 1

	const original = [...Array((density*squares) + 1).keys()].map((val) => val - 10)
	const vertices = new Float32Array(
		original.flatMap((x) => {
			return original.flatMap((y) => {
                x = x/density
                y = y/density
				return [x, calculateZ(x, y), y]
			})
		})
	)

    // const indices = [1,2,2]
	const indices = [...Array((density+1) * (density)).keys()].flatMap((x) => {
		const triangle1 = (x % (density+1) === (density)) ? [] : [x, x, x + 1]
		const triangle2 = [x, x, x+(density+1)]
		return [...triangle1, ...triangle2]
	})

	geometry.setIndex(indices)
	geometry.setAttribute('position', new BufferAttribute(vertices, 3))

	// 3. Create mesh and add to scene
	const mesh = new Mesh(geometry, material)
</script>

<T is={mesh} />
