import { writable } from 'svelte/store'
import type { Matrix, Vec } from './calculations'

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

class ConsoleLine {}

export class ConsoleEigenvector extends ConsoleLine {
	constructor(public readonly vec1: Vec | null, public readonly vec2: Vec | null, public readonly originalMatrix: Matrix) {
		super()
	}
}
