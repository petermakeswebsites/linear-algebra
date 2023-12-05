<script lang="ts">
	import Console from "./Console.svelte"
import Display2D from "./Display2D.svelte"
	import Equations from "./Equations.svelte"
	import GlobalMatrix from "./GlobalMatrix.svelte"
	import Sliders from "./Sliders.svelte"
	import VectorsControl from "./VectorsControl.svelte"


</script>
<div class="fixed w-64 bg-blue-950 text-white rounded-xl shadow-xl border-black right-2 top-2 p-4">
    <Display2D />
    <GlobalMatrix /><br /><br />
    <!-- <VectorsControl /><br /> -->
    <Sliders />
    <br />
    <Equations />
    <Console />
</div>