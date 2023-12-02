import { get, writable, derived } from "svelte/store";
import { Matrix, matrixTweener } from "./calculations";
import { tweened } from "svelte/motion";
import { cubicInOut } from "svelte/easing";

export const GlobalTransformMatrix = writable(Matrix.identity(3))
GlobalTransformMatrix.subscribe((mtx) => {
    console.log(mtx)
    mtx.print()
    
})
export function setGlobalTransformMatrix(matrix : Matrix) {
    if (!matrix.square) throw new Error("Tried to do a global transform with a non square matrix")
    if (matrix.cols !== 3) throw new Error("Tried to do a global transform with cols and rows not equal to 3")
    GlobalBeforeTweenedMatrix.set(matrix)
}
export const GlobalBeforeTweenedMatrix = tweened(get(GlobalTransformMatrix), {
    duration: 500,
    interpolate: matrixTweener,
    easing: cubicInOut
})

GlobalTransformMatrix.subscribe(mtx => {
    GlobalBeforeTweenedMatrix.set(mtx)
})

export const GlobalTransformShift = writable(1)

export const GlobalTweenedMatrix = derived([GlobalTransformShift, GlobalBeforeTweenedMatrix], ([shift, mtx]) => {
    const tweener = matrixTweener(Matrix.identity(3), mtx)
    return tweener(shift)
})

// @ts-ignore
globalThis.setGlobalTransformMatrix = setGlobalTransformMatrix