<script lang="ts">
	import { T } from '@threlte/core'
	import { BoxGeometry, BufferAttribute, BufferGeometry, PlaneGeometry } from 'three'
	const geometry = new PlaneGeometry(20,20)
	const vertices = geometry.getAttribute('position').array
	for (let i = 0; i < vertices.length; i += 3) {
		const x = vertices[i]
		const y = vertices[i + 1]
        vertices[i] = vertices[i + 1] + x
		// @ts-ignore
		// vertices[i + 2] = noise(x / 4, y / 4)
	}
	geometry.computeVertexNormals()
</script>

<!-- <Grid
	position.y={0}
	plane={'xy'}
	cellColor="#ffff00"
	sectionColor="#ffff00"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={1}
/> -->

<!-- <Grid
	position.y={0}
	plane={'zy'}
	cellColor="#00ffff"
	sectionColor="#00ffff"
	sectionThickness={1}
	fadeDistance={25}
	cellSize={1}
    
>
<T is={geometry} />
</Grid> -->

<!-- <Grid
	position.y={0}
	cellColor="#ff00ff"
	sectionColor="#ff00ff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={1}
/> -->
<!-- <Grid
	position.y={0}
	cellColor="#ff00ff"
	sectionColor="#ff00ff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={1}
>
	<T is={geometry} />
</Grid> -->
