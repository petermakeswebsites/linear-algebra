<script lang="ts">
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
	import Overlay from './overlay/Overlay.svelte'
</script>

<Overlay />
<Canvas>
  <Scene />
</Canvas>
