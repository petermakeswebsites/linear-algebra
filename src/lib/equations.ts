import { writable } from 'svelte/store'
import { Matrix, Vec } from './calculations'
import { Num } from './complex'
import { astMaker } from './equations-ast'

export const equations = writable('# Create a matrix\nA = [1,0;1,1]\n# Create a vector\nv = [0.5,0.5]\n# Skew the vector\nvf = A*v\n\n# Create two 3D vectors\nva = [2,1,1]\nvb = [1,2,0]\n# Get the cross product\nvc = va*vb\nvd = vb*va')

type Vecs = Map<string, Vec>
type Matrices = Map<string, Matrix>
type Scalars = Map<string, Num>
function parse(eq: string, vecs: Vecs, matrices: Matrices, scalars : Scalars) : {
    vecs : Vecs,
    matrices : Matrices,
    scalars : Scalars
} {
	const sides = eq.split('=')
	if (sides.length < 2) throw new Error('Need an equals sign')
	if (sides.length > 2) throw new Error('Only one equals sign allowed per side')
	const assigner = sides[0].trim()
	// Follow BEMDAS - later, lets just do addition for now
	const process = sides[1].trim()
	const parsed = evaluate(process, vecs, matrices, scalars)
    if (parsed instanceof Matrix) {
        const newMatrices = new Map(matrices)
        newMatrices.set(assigner, parsed)
        return {vecs, scalars, matrices: newMatrices}
    } else if (parsed instanceof Num) {
        const newScalars = new Map(scalars)
        newScalars.set(assigner, parsed)
        return {vecs, scalars: newScalars, matrices}
    } else if (parsed instanceof Vec) {
        const newVecs = new Map(vecs)
        newVecs.set(assigner, parsed)
        return {vecs: newVecs, scalars, matrices}
    } else {
        throw new Error(`Parsed RHS but it was not a scalar, matrix, or vector`)
    }
}


astMaker
function evaluate(eq: string, vecs: Vecs, matrices: Matrices, scalars : Scalars) : Vec | Matrix | Num {
    // const bracketsPlus =  eq.split(/(?<!\[[^\]]*)+(?![^\[]*\])/).map((t) => t.trim())
    const bracketsMinus = eq.split(/(?<!\[[^\]]*)-(?![^\[]*\])/).map((t) => t.trim())
	const adders = eq.split('+').map((t) => t.trim())
	const subbers = eq.split('-').map((t) => t.trim())
	const multipliers = eq.split('*').map((t) => t.trim())
	const dots = eq.split('@').map((t) => t.trim())
	if (adders.length > 1) {
		const LHS = <string>(adders.shift())
		const RHS = adders.join('+')
        const LHSres = evaluate(LHS, vecs, matrices, scalars)
        const RHSres = evaluate(RHS, vecs, matrices, scalars)
        return evalAdd(LHSres, RHSres)
        
	} else if (subbers.length > 1) {
		const LHS = <string>(subbers.shift())
		const RHS = subbers.join('-')
        const LHSres = evaluate(LHS, vecs, matrices, scalars)
        const RHSres = evaluate(RHS, vecs, matrices, scalars)
        return evalAdd(LHSres, RHSres.scale(-1))
	} else if (multipliers.length > 1) {
		const LHS = <string>(multipliers.shift())
		const RHS = multipliers.join('*')
        const LHSres = evaluate(LHS, vecs, matrices, scalars)
        const RHSres = evaluate(RHS, vecs, matrices, scalars)
        return evalMult(LHSres, RHSres)
    }

    // None, see if it matches our thing
    if (eq[0] === "[" && eq[eq.length -1] === "]") {
        // Extract inside
        const inside = eq.slice(1, -1)
        const rows = inside.split(";").map(t => new Vec(t.trim().split(",").map(num => new Num(parseFloat(num.trim())))))
        if (rows.length === 1) {
            // Single vector
            return rows[0]
        } else {
            return new Matrix(rows)
        }
    } else if (/^[\-0-9.]+$/.test(eq)) {
        // Looks like a number
        return new Num(parseFloat(eq))
    } else if (vecs.has(eq) || scalars.has(eq) || matrices.has(eq)) {
        const rtn = matrices.get(eq) || vecs.get(eq) || scalars.get(eq)
        if (rtn === undefined) throw new Error(`We checked to see if '${eq}' was in the list of variables and it was but it could not be accessed for some reason.`)
        return rtn
    } else {
        throw new Error("Could not parse: " + eq)
    }
}


function evalMult(left: Vec | Matrix | Num, right : Vec | Matrix | Num) : Vec | Matrix | Num {
    if (left instanceof Vec) {
        if (right instanceof Vec) {
            if (left.dimensions === right.dimensions) {
                if (left.dimensions !== 3) throw new Error(`Dimensions must be 3 in order to cross product, got ${left.dimensions}`)
                return left.cross(right)
            } else {
                throw new Error(`Dimension mismatch: ${left.dimensions}, ${right.dimensions}`)
            }
        }
    } else if (left instanceof Matrix) {
        if (right instanceof Vec) {
            const rightMtx = right.toMatrix()
            const res =  left.times(rightMtx) // Error handling built in
            if (res.cols === 1) {
                return res.toVec()
            } else {
                return res
            }
        }
    }
    throw new Error("Tried to multiply but didn't catch anything!")
    //     } else if (right instanceof Num) { // scalar
    //         return left.scale(right)
    //     } else if (right instanceof Matrix) {
    //         if (right.cols !== 1) throw new Error(`Tried to add, but vector on left and matrix on right, they must be the same dimensions.`)
    //         if (right.rows !== left.dimensions) throw new Error(`Vector on left had ${left.dimensions} dimension(s) but matrix on right had ${right.rows} rows. Need exact match to add.`)

    //         // Should return vec for simplicity
    //         return right.toVec().add(left)
    //     }
    // } else if (right instanceof Vec) {
    //     // Flip around, it's legal for addition
    //     return evalAdd(right, left)
    // } else if (left instanceof Num) {
    //     return right.scale(left)
    // } else if (left instanceof Matrix) {
    //     if (right instanceof Matrix) {
    //         if (!left.sameDimensionsAs(right)) throw new Error(`Cannot multiply ${left.size} matrix with ${right.size} matrix`)
    //         return left.add(right)
    //     } else if (right instanceof Num) {
    //         return left.scale(right)
    //     } else {
    //         throw new Error("Tried to add. Left was a matrix, but right was neither matrix nor number!")
    //     }
    // } else {
    //     throw new Error(`These types could not be detected for addition: ${Object.getPrototypeOf(left)} and ${Object.getPrototypeOf(right)}`)
    // }
    throw new Error(`Got to the end of addition, this should never happen? ${left.constructor?.name} and ${right.constructor?.name}`)
}

function evalAdd(left: Vec | Matrix | Num, right : Vec | Matrix | Num) : Vec | Matrix | Num {
    if (left instanceof Vec) {
        if (right instanceof Vec) {
            if (left.dimensions === right.dimensions) {
                return left.add(right)
            } else {
                throw new Error(`Dimension mismatch: ${left.dimensions}, ${right.dimensions}`)
            }
        } else if (right instanceof Num) { // scalar
            return left.scale(right)
        } else if (right instanceof Matrix) {
            if (right.cols !== 1) throw new Error(`Tried to add, but vector on left and matrix on right, they must be the same dimensions.`)
            if (right.rows !== left.dimensions) throw new Error(`Vector on left had ${left.dimensions} dimension(s) but matrix on right had ${right.rows} rows. Need exact match to add.`)

            // Should return vec for simplicity
            return right.toVec().add(left)
        }
    } else if (right instanceof Vec) {
        // Flip around, it's legal for addition
        return evalAdd(right, left)
    } else if (left instanceof Num) {
        return right.scale(left)
    } else if (left instanceof Matrix) {
        if (right instanceof Matrix) {
            if (!left.sameDimensionsAs(right)) throw new Error(`Cannot multiply ${left.size} matrix with ${right.size} matrix`)
            return left.add(right)
        } else if (right instanceof Num) {
            return left.scale(right)
        } else {
            throw new Error("Tried to add. Left was a matrix, but right was neither matrix nor number!")
        }
    } else {
        throw new Error(`These types could not be detected for addition: ${Object.getPrototypeOf(left)} and ${Object.getPrototypeOf(right)}`)
    }
    throw new Error(`Got to the end of addition, this should never happen? ${left.constructor?.name} and ${right.constructor?.name}`)
}

const emptyEqResults = {
    scalars: new Map<string, Num>(),
    matrices: new Map<string, Matrix>(),
    vecs: new Map<string, Vec>()
}

export const eqResults = writable({
    scalars: new Map<string, Num>(),
    matrices: new Map<string, Matrix>(),
    vecs: new Map<string, Vec>()
})

export const eqError = writable("")
eqResults.subscribe(console.log)

equations.subscribe((equations) => {
    console.clear()
	const eqs = equations.split('\n').filter(eq => !eq.startsWith("#")).filter(eq => eq.length)
    try {
        eqs.forEach(eq => {
            console.log(astMaker(eq))
        })
    } catch(e) {
        console.log(e)
    }

    try {
        const final = eqs.reduce((prev, current) => {
            return parse(current, prev.vecs, prev.matrices, prev.scalars)
        }, emptyEqResults)

        eqResults.set(final)
        eqError.set("")

    } catch(e) {
        eqError.set(e)
    }
})
