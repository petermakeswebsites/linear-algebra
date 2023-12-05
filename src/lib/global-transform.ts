import { get, writable, derived } from "svelte/store";
import { Matrix, matrixTweener } from "./calculations";
import { tweened } from "svelte/motion";
import { cubicInOut } from "svelte/easing";
// import { parseEquations } from "./equations";

/**
 * This is the most 'back-end' transform matrix, the one
 * that's in the background regardless of custom overrides 
 * and animations and stuff.
 */
export const GlobalTransformMatrix = writable(Matrix.identity(3))
// GlobalTransformMatrix.subscribe((mtx) => {
//     mtx.print()
// })

//@ts-ignore
globalThis.getGlobalMatrix = () => get(GlobalTransformMatrix)

// This is the function to set the matrix
export function setGlobalTransformMatrix(matrix : Matrix) {
    if (!matrix.square) throw new Error("Tried to do a global transform with a non square matrix")
    if (matrix.cols !== 3) throw new Error("Tried to do a global transform with cols and rows not equal to 3")
    GlobalTransformMatrix.set(matrix)

    // Even though there is a subscription for this one, 
    // parseEquations()
}

const OverrideGlobalMatrix = writable<null | Matrix>(null)
// This is the function to set the matrix
export function setGlobalOverrideMatrix(matrix : Matrix | null) {
    if (matrix === null) {
        OverrideGlobalMatrix.set(null)
        return
    }
    if (!matrix.square) throw new Error("Tried to do a global transform with a non square matrix")
    if (matrix.cols !== 3) throw new Error("Tried to do a global transform with cols and rows not equal to 3")
    OverrideGlobalMatrix.set(matrix)
    // parseEquations()
}

const settings = {
    duration: 500,
    interpolate: matrixTweener,
    easing: cubicInOut
}

export const suppressGlobalTweeningDelay = writable(false)
suppressGlobalTweeningDelay.subscribe((suppress) => {
    settings.duration = suppress ? 0:500
})

const GlobalBeforeTweenedMatrix = tweened(get(GlobalTransformMatrix), settings)

// @ts-ignore
globalThis.changeSpeed = (num) => settings.duration = num

export const GlobalTransformShift = writable(1)


/**
 * This is the one everyone should be listening to, includes the shift
 * slider so you can see what's going on
 */
export const GlobalTweenedMatrix = derived([GlobalTransformShift, GlobalBeforeTweenedMatrix], ([shift, mtx]) => {
    const tweener = matrixTweener(Matrix.identity(3), mtx)
    return tweener(shift)
})

// @ts-ignore
globalThis.setGlobalTransformMatrix = setGlobalTransformMatrix

function updateBeforeTweened() {
    const globalTransformMatrix = get(GlobalTransformMatrix)
    const overrideGlobalMatrix = get(OverrideGlobalMatrix)
    GlobalBeforeTweenedMatrix.set(overrideGlobalMatrix ? overrideGlobalMatrix : globalTransformMatrix)
}

GlobalTransformMatrix.subscribe(() => {
    updateBeforeTweened()
})

OverrideGlobalMatrix.subscribe(() => {
    updateBeforeTweened()
})

export const globalMatrixIsBeingOveridden = derived(OverrideGlobalMatrix, override => {
    return !!override
})