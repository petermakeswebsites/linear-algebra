import { writable } from 'svelte/store'
import type { Matrix, Vec } from './calculations'
import type { Num } from './complex'

const { subscribe, set, update } = writable<ConsoleLine[]>([])
export const consoleEntries = { subscribe }
export const consoleReset = () => {
	set([])
}
export const consoleAdd = (line: ConsoleLine) => {
	update((original) => {
		original.push(line)
		return original
	})
}

/**
 * Might add some base properties and methods at some point
 */
class ConsoleLine {}

export class ConsoleEigenvector extends ConsoleLine {
	constructor(
		public readonly vec1: Vec | null,
		public readonly vec2: Vec | null,
		public readonly originalMatrix: Matrix
	) {
		super()
	}
}

export class ConsoleDeterminant extends ConsoleLine {
	constructor(public readonly originalMatrix: Matrix, public readonly det: Num) {
		super()
	}
}

export class ConsoleValue extends ConsoleLine {
	constructor(public readonly value: Matrix | Num | Vec) {
		super()
	}
}
