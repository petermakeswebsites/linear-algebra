import { get, writable } from "svelte/store";
import type { Vec } from "./calculations";

export class DisplayVector {
    constructor(public readonly destination: Vec) {}
}
export const vectors = writable(new Map<string, DisplayVector>())
export function setVec(id: string, newDest: Vec | null) {
    vectors.update((list) => {
        // const already = list.get(id)
        // if (already)
        if (newDest === null) {
            list.delete(id)
        } else {
            list.set(id, new DisplayVector(newDest))
        }
        return list
    })
}

export function newVec(newDest: Vec) {
    const nextLetter = getNextAvailableLetter([...get(vectors).keys()])
    setVec(nextLetter, newDest)
}

function getNextAvailableLetter(strings: string[]): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const normalizedStrings = strings.map(s => s.toLowerCase().charAt(0)).filter(c => alphabet.includes(c));

    // Check for single letters first
    for (const letter of alphabet) {
        if (!normalizedStrings.includes(letter)) {
            return letter;
        }
    }

    // If all single letters are taken, start checking combinations
    for (const firstLetter of alphabet) {
        for (const secondLetter of alphabet) {
            const combination = firstLetter + secondLetter;
            if (!normalizedStrings.includes(combination)) {
                return combination;
            }
        }
    }

    throw new Error('Ran out of letter combinations');
}

// @ts-ignore
globalThis.setVec = setVec
