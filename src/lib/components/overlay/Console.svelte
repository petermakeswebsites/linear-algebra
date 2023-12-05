<script lang="ts">
	import { ConsoleEigenvector, consoleEntries } from '$lib/console'
	import { slide } from 'svelte/transition'
	import MatrixDisplay from './equations/MatrixDisplay.svelte'
	import { eqError } from '$lib/equations'
</script>

{#if $consoleEntries.length || $eqError}
	<div
		transition:slide
		class="absolute right-[calc(100%+0.5rem)] bg-blue-950 w-96 text-white rounded-xl shadow-xl border-black top-0 p-4"
	>
    {#if $eqError}
        <div>
            <h2 class="text-lg text-orange-300">Oops!</h2>
            <p>{$eqError}</p>
        </div>
        {/if}
		{#each $consoleEntries as entry}
			{#if entry instanceof ConsoleEigenvector}
				<h2 class="text-lg">Eigenvectors:</h2>
				<div class="flex items-center gap-4">
					<div>
						<MatrixDisplay mtx={entry.originalMatrix.transpose} />
					</div>
					<div>
						λ<sub>1</sub>: {entry.vec1?.toString()} <br />
						λ<sub>2</sub>: {entry.vec2?.toString()}
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
