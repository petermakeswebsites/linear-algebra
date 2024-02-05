<script lang="ts">
	import {
		ConsoleDeterminant,
		ConsoleEigenvector,
		ConsoleValue,
		consoleEntries
	} from '$lib/console'
	import { slide } from 'svelte/transition'
	import MatrixDisplay from './equations/MatrixDisplay.svelte'
	import { eqError } from '$lib/equations'
	import { Matrix, Vec } from '$lib/calculations'
</script>

{#if $consoleEntries.length || $eqError}
	<div
		transition:slide
		class="absolute flex flex-col gap-2 right-[calc(100%+0.5rem)] bg-blue-950 w-96 text-white rounded-xl shadow-xl border-black top-0 p-4"
	>
		{#if $eqError}
			<div>
				<h2 class="text-lg text-orange-300">Oops!</h2>
				<p>{$eqError}</p>
			</div>
		{/if}
		{#each $consoleEntries as entry}
			<div>
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
				{:else if entry instanceof ConsoleDeterminant}
					<h2 class="text-lg">Determinant:</h2>
					<div class="flex items-center gap-4">
						<div>
							<MatrixDisplay mtx={entry.originalMatrix.transpose} />
						</div>
						<div>
							det: {entry.det?.toString()}
						</div>
					</div>
				{:else if entry instanceof ConsoleValue}
					<!-- <h2 class="text-lg">Determinant:</h2> -->
					<div class="flex items-center gap-4">
						<div>
							{#if entry.value instanceof Matrix}
								Matrix: <MatrixDisplay mtx={entry.value.transpose} />
							{:else if entry.value instanceof Vec}
								Vec: {entry.value.toString()}
							{:else}
								Number: {entry.value}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
