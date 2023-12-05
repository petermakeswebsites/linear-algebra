import { Matrix, Vec } from './calculations'
import { Num, quadraticRoots } from './complex'

export function eigenvalues(mtx: Matrix) : [Num, Num] {
	if (!mtx.square) throw new Error(`Can only get eigenvalues on a square matrix`)
	if (mtx.rows !== 2) throw new Error(`Can only get eigenvalues on a 2x2 matrix for now`)

	const a = mtx.get(1, 1)
	const b = mtx.get(1, 2)
	const c = mtx.get(2, 1)
	const d = mtx.get(2, 2)

	const lambdaSquared = Num.Create(1)
	const lambdaSingle = a.scale(-1).minus(d)
	const constant = a.times(d).minus(b.times(c))

	console.log(`${lambdaSquared}λ² + ${lambdaSingle}λ + ${constant}`)

	const roots = quadraticRoots(lambdaSquared, lambdaSingle, constant)
    console.log(`${roots[0].toString()}, ${roots[1].toString()}`)
    return roots
}

/**
 *
 * @param mtx 2x2 or 3x3 matrix, throws if not compatible
 * @returns
 */
export function toThree(mtx: Matrix) {
	if (!mtx.square) throw new Error(`Attempting to force a 3x3 matrix from a non-square matrix`)
	if (mtx.rows === 3) return mtx
	if (mtx.rows !== 2) throw new Error(`Matrix is not a 3x3 or 2x2 and cannot be upgraded to 3x3`)

	// We create these going down remember ? So it's transposed than what you might think
	return Matrix.fromNumberArray(
		[
			mtx.get(1, 1),
			mtx.get(2, 1),
			Num.Create(0),
			mtx.get(1, 2),
			mtx.get(2, 2),
			Num.Create(0),
			Num.Create(0),
			Num.Create(0),
			Num.Create(1)
		],
		3
	)
}

export function eigenvectors(m : Matrix) {
    if (!m.square) throw new Error(`Matrix is not square, must be square in order to get eigenvectors.`)
    if (m.rows !== 2) throw new Error(`Eigenvectors currently only are supported for 2x2 matrices.`)

    const [λ1, λ2] = eigenvalues(m)

    const a = m.get(1,1)
    const b = m.get(1,2)
    const c = m.get(2,1)
    const d = m.get(2,2)

    function compute(λ : Num) : Vec | null {
        const eq1_x1 = (a.minus(λ))
        const eq1_x2 = b
        // console.log({λ, eq: `${eq1_x1.toString()}x + ${eq1_x2.toString()}y`})
        const rtn1 = solveSystemOfEq(eq1_x1, eq1_x2)

        const eq2_x1 = c
        const eq2_x2 = (d.minus(λ))
        // console.log({λ, eq: `${eq2_x1.toString()}x + ${eq2_x2.toString()}y`})
        const rtn2 = solveSystemOfEq(eq2_x1, eq2_x2)

        if (rtn1 === null || rtn2 === null) {
            return rtn1 || rtn2
        } else {
            if (rtn1.isSamedirectionAs(rtn2)) return rtn1
            throw new Error(`${rtn1.toString()} is not in the same direction as ${rtn2.toString()} - this is likely a limitation of floating point accuracy... check manually :)`)
        }
    }

    const vec1 = compute(λ1)
    const vec2 = compute(λ2)

    // console.log(vec1?.toString(), vec2?.toString())

    return [vec1,vec2] as const
}

/**
 * x + y = 0
 * @param x 
 * @param y 
 */
function solveSystemOfEq(x : Num, y : Num) : Vec | null {
    if (x.isZero && y.isZero) return null

    let rhs = y.scale(-1)
    let lhs = x

    if (lhs.isZero) {
        // 0x = ky
        // y = 0
        // x can be anything
        return Vec.fromNumberArray([1,0])
    }

    if (rhs.isZero) {
        // kx = 0y
        // x = 0
        // y can be anything
        return Vec.fromNumberArray([0,1])
    }

    // E.g. 3x = 1y
    // Counterintuitively,
    // y = 3x, which means the vector would be
    // [1, 3]
    return new Vec([rhs, lhs])

    // return newVec.toIntegerVec() || newVec
}

/**
 * 
 * @param ratio Must be above one
 * @param check 
 * @returns 
 */
function gcpNum(ratio : Num, check = 50) : number | null {
    for (let i = 1; i  < check; i++) {
        const testRe = ratio.re * i
        const testIm = ratio.im * i
        if (testRe % 1 === 0 && testIm % 1 === 0) return i
    }
    return null
}

/**
 * 
 * @param ratio Must be above one
 * @param check 
 * @returns 
 */
function gcp(ratio : number, check = 50) : number | null {
    for (let i = 1; i  < check; i++) {
        const test = ratio * i
        console.log(test)
        if (test % 1 === 0) return i
    }
    return null
}

// @ts-ignore
globalThis.gcp = gcp