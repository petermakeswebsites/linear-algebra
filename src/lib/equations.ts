import { get, writable } from 'svelte/store'
import { Matrix, Vec } from './calculations'
import { Num } from './complex'
import {
	astMaker,
	type AstComma,
	type AstNode,
	type AstSemi,
	type AstFunction,
    type AstToken
} from './equations-ast'
import { parseFunction } from './equations-functions'
import { GlobalTweenedMatrix, globalMatrixIsBeingOveridden, setGlobalOverrideMatrix } from './global-transform'
import type { Extra } from './equations-extras'
import { toThree } from './matrix-calcs'
import { slider } from './sliders'
import { equationTemplates } from './equation-templates'
import { consoleReset } from './console'

export const equations = writable(
	equationTemplates.Rotation
)

type Vecs = Map<string, Vec>
type Matrices = Map<string, Matrix>
type Scalars = Map<string, Num>
type Extras = Map<string, Extra>
function parse(
	eq: string,
	vecs: Vecs,
	matrices: Matrices,
	scalars: Scalars,
	extras : Extras,
	globalMatrixUpdate : Matrix | null
): {
	vecs: Vecs
	matrices: Matrices
	scalars: Scalars
	extras : Extras
	globalMatrixUpdate : Matrix | null
} {
    // Debug
    const log = (eq.startsWith("!")) 
    if (log) eq = eq.slice(1)

	const sides = eq.split('=')
	if (sides.length < 2) {
		const parsed = evaluate(eq.trim(), vecs, matrices, scalars, globalMatrixUpdate)
		if (log) {
			console.log(parsed)
			parsed.print()
		}
		return { vecs, matrices, scalars, globalMatrixUpdate, extras}
	}
	if (sides.length > 2) throw new Error('Only one equals sign allowed per side')
	const assigner = sides[0].trim()
	// Follow BEMDAS - later, lets just do addition for now
	const process = sides[1].trim()
	const parsed = evaluate(process, vecs, matrices, scalars, globalMatrixUpdate)
    if (log) {
        console.log(parsed)
        parsed.print()
    }

	if (assigner === "G") {
		if (parsed instanceof Matrix) {
			if (!parsed.square || (parsed.rows !== 2 && parsed.rows !== 3)) throw new Error(`Global matrix be 3x3 or 2x2 square`)
			return {
				vecs, scalars, matrices, extras, globalMatrixUpdate: parsed
			}
		}
		throw new Error(`Cannot assign anything but a matrix to G`)
	}

	if (parsed instanceof Matrix) {
		const newMatrices = new Map(matrices)
		newMatrices.set(assigner, parsed)
		return { vecs, scalars, matrices: newMatrices, extras, globalMatrixUpdate: null }
	} else if (parsed instanceof Num) {
		const newScalars = new Map(scalars)
		newScalars.set(assigner, parsed)
		return { vecs, scalars: newScalars, matrices, extras, globalMatrixUpdate: null }
	} else if (parsed instanceof Vec) {
		const newVecs = new Map(vecs)
		newVecs.set(assigner, parsed)
		return { vecs: newVecs, scalars, matrices, extras, globalMatrixUpdate: null }
	} else {
		throw new Error(`Parsed RHS but it was not a scalar, matrix, or vector`)
	}
}

function evaluate(
	eq: string,
	vecs: Vecs,
	matrices: Matrices,
	scalars: Scalars,
	globalMatrixUpdate : Matrix | null
): Matrix | Vec | Num {
	const ast = astMaker(eq)
	return processAstNode(ast, vecs, matrices, scalars, globalMatrixUpdate)
}

function processAstNode(
	node: AstNode,
	vecs: Vecs,
	matrices: Matrices,
	scalars: Scalars,
	globalMatrixUpdate : Matrix | null
): Matrix | Vec | Num {
	if (node.name === 'add') {
		return evalAdd(
			processAstNode(node.lhs, vecs, matrices, scalars, globalMatrixUpdate),
			processAstNode(node.rhs, vecs, matrices, scalars, globalMatrixUpdate)
		)
	} else if (node.name === 'sub') {
		return evalAdd(
			processAstNode(node.lhs, vecs, matrices, scalars, globalMatrixUpdate),
			processAstNode(node.rhs, vecs, matrices, scalars, globalMatrixUpdate).scale(-1)
		)
	} else if (node.name === 'bracket') {
		return createMatrixFromAst(node.inner, vecs, matrices, scalars, globalMatrixUpdate)
	} else if (node.name === 'comma') {
		throw new Error(`A comma list was found in the wild! This should not occur.`)
	} else if (node.name === 'dot') {
	} else if (node.name === 'function') {
		return processFunction(node, vecs, matrices, scalars, globalMatrixUpdate)
	} else if (node.name === 'mult') {
		return evalMult(
			processAstNode(node.lhs, vecs, matrices, scalars, globalMatrixUpdate),
			processAstNode(node.rhs, vecs, matrices, scalars, globalMatrixUpdate)
		)
	} else if (node.name === 'divide') {
		return evalDiv(
			processAstNode(node.lhs, vecs, matrices, scalars, globalMatrixUpdate),
			processAstNode(node.rhs, vecs, matrices, scalars, globalMatrixUpdate)
		)
	} else if (node.name === 'parenthesis') {
		throw new Error('This should technically never happen')
	} else if (node.name === 'pow') {
        return evalPow(
			processAstNode(node.lhs, vecs, matrices, scalars, globalMatrixUpdate),
			processAstNode(node.rhs, vecs, matrices, scalars, globalMatrixUpdate)
        )
	} else if (node.name === 'token') {
		return processToken(node, vecs, matrices, scalars, globalMatrixUpdate)
	}
    throw new Error(`Unimplemented node: ${node.name}`)
}

function processToken(node: AstToken, vecs: Vecs, matrices: Matrices, scalars: Scalars, globalMatrixUpdate : Matrix | null) : Vec | Num | Matrix {

    let rtn : Matrix | Num | Vec | undefined
    const scalar = scalars.get(node.token)
    if (scalar) rtn = scalar
    const vec = vecs.get(node.token)
    if (vec) rtn = vec
    const matrix = matrices.get(node.token)
    if (matrix) rtn = matrix
    if (node.token === "G") rtn = globalMatrixUpdate ? globalMatrixUpdate : get(GlobalTweenedMatrix)
    if (node.token === "pi") rtn = Num.Create(Math.PI)
	if (node.token === "slider") rtn = Num.Create(get(slider))

    if (rtn) {
        return (node.negative ? rtn.scale(-1) : rtn)
    }

    let numRtn : Num | undefined
    // Match imaginary
    const isNumber = /^\d+(\.\d*)?$/.test(node.token)
    if (isNumber) {
        numRtn = new Num(parseFloat(node.token))
    }

    const isImaginaryNumber = node.token === "i" || /^\d+(\.\d*)?i$/.test(node.token)
    if (isImaginaryNumber) {
        numRtn = new Num(0, parseFloat(node.token === "i" ? "1" : node.token))
    }

    if (numRtn) {
        return (node.negative ? numRtn.scale(-1) : numRtn)
    }

    throw new Error(`Unrecognised token: ${node.token}`)
}

function processFunction(node: AstFunction, vecs: Vecs, matrices: Matrices, scalars: Scalars,
	globalMatrixUpdate : Matrix | null) {
	const args = node.args.list.map((val) => processAstNode(val, vecs, matrices, scalars, globalMatrixUpdate))
	const fn = node.function
	return parseFunction(fn, args, node.negative)
}

function createMatrixFromAst(
	ast: AstComma | AstSemi,
	vecs: Vecs,
	matrices: Matrices,
	scalars: Scalars,
	globalMatrixUpdate : Matrix | null
): Matrix | Vec {
	const list =
		ast.name === 'comma'
			? [ast.list.map((val) => processAstNode(val, vecs, matrices, scalars, globalMatrixUpdate))]
			: ast.list.map((comma) =>
					comma.list.map((val) => processAstNode(val, vecs, matrices, scalars, globalMatrixUpdate))
			  )
	const amountInFirstVector = list[0].length
	if (!list.every((val) => val.length === amountInFirstVector)) {
		throw new Error(
			`Matrix is not rectangular. Please make sure all columns and rows are straight.`
		)
	}

	const isIllegal = list.flatMap((nodeList) => nodeList).some((val) => !(val instanceof Num))
	if (isIllegal) throw new Error(`All elements in a matrix or vector should compute to a number`)
	const toVecs = list.map((nums) => {
		return new Vec(<Num[]>nums) // casting because of check above
	})
	// All numbers
	if (list.length === 1) {
		// Vector
		return toVecs[0]
	} else {
		return new Matrix(toVecs).transpose
	}
}

function evalPow(left: Vec | Matrix | Num, right: Vec | Matrix | Num): Vec | Matrix | Num {
    if (left instanceof Matrix) {
        if (right instanceof Num) {
            if (!right.isRealInteger) throw new Error(`Cannot raise to the power of an imaginary number`)
            return left.pow(right.re)
        }
    }
    throw new Error('Pow not implemented for these types yet')
}

/**
 * Divide
 * @param left
 * @param right
 * @returns
 */
function evalDiv(left: Vec | Matrix | Num, right: Vec | Matrix | Num): Vec | Matrix | Num {
    if (right instanceof Vec)  throw new Error(`Cannot divide by vector`) 
    if (left instanceof Num) {
		if (right instanceof Matrix) throw new Error(`Cannot divide number by matrix`)
		if (right instanceof Num) {
			return left.times(right.inverse)
		}
    } else if(left instanceof Matrix) {
		if (right instanceof Num) {
			return left.scale(right.inverse)
		} else if (right instanceof Matrix) {
			return left.times(right.inverse)
		}
	} else if (left instanceof Vec) {
		if (right instanceof Matrix) throw new Error(`Cannot divide vector by matrix`)
		if (right instanceof Vec) throw new Error(`Cannot divide vec by vec`)
		return left.scale(right.inverse)
	}
	throw new Error(
		`Got to the end of division checks, this should never happen! ${left.constructor?.name} and ${right.constructor?.name}`
	)
}

/**
 * Multiply or cross product if vectors
 * @param left
 * @param right
 * @returns
 */
function evalMult(left: Vec | Matrix | Num, right: Vec | Matrix | Num): Vec | Matrix | Num {
	if (left instanceof Vec) {
		if (right instanceof Vec) {
			if (left.dimensions === right.dimensions) {
				if (left.dimensions !== 3)
					throw new Error(`Dimensions must be 3 in order to cross product, got ${left.dimensions}`)
				return left.cross(right)
			} else {
				throw new Error(`Dimension mismatch: ${left.dimensions}, ${right.dimensions}`)
			}
		} else if (right instanceof Matrix) {
            const leftMtx = left.toMatrix()
			const res = leftMtx.times(right) // Error handling built in
            if (res.cols === 1) {
				return res.toVec()
			} else {
				return res
			}
        } else if (right instanceof Num) {
            return left.scale(right)
        }
	} else if (left instanceof Matrix) {
		if (right instanceof Vec) {
			const rightMtx = right.toMatrix()
			const res = left.times(rightMtx) // Error handling built in
			if (res.cols === 1) {
				return res.toVec()
			} else {
				return res
			}
		} else if (right instanceof Matrix) {
            return left.times(right)
        } else if (right instanceof Num) {
            return left.scale(right)
        }
    } else if (left instanceof Num) {
        return right.scale(left)
    }
	throw new Error(
		`Got to the end of multiplication, this should never happen? ${left.constructor?.name} and ${right.constructor?.name}`
	)
}

function evalAdd(left: Vec | Matrix | Num, right: Vec | Matrix | Num): Vec | Matrix | Num {
	if (left instanceof Vec) {
		if (right instanceof Vec) {
			if (left.dimensions === right.dimensions) {
				return left.add(right)
			} else {
				throw new Error(`Dimension mismatch: ${left.dimensions}, ${right.dimensions}`)
			}
		} else if (right instanceof Num) {
			// scalar
			return left.scale(right)
		} else if (right instanceof Matrix) {
			if (right.cols !== 1)
				throw new Error(
					`Tried to add, but vector on left and matrix on right, they must be the same dimensions.`
				)
			if (right.rows !== left.dimensions)
				throw new Error(
					`Vector on left had ${left.dimensions} dimension(s) but matrix on right had ${right.rows} rows. Need exact match to add.`
				)

			// Should return vec for simplicity
			return right.toVec().add(left)
		}
	} else if (right instanceof Vec) {
		// Flip around, it's legal for addition
		return evalAdd(right, left)
	} else if (left instanceof Num) {
		if (right instanceof Num) {
			return right.add(left)
		} else {
			throw new Error(`Cannot add a number to a matrix. ${right.square ? `Consider multiplying the number by the identity matrix identity(${right.cols})` : ''}`)
		}
	} else if (left instanceof Matrix) {
		if (right instanceof Matrix) {
			if (!left.sameDimensionsAs(right))
				throw new Error(`Cannot add ${left.size} matrix with ${right.size} matrix`)
			return left.add(right)
		} else if (right instanceof Num) {
			throw new Error(`Cannot add a number to a matrix. ${left.square ? `Consider multiplying the number by the identity matrix identity(${left.cols})` : ''}`)
		} else {
			throw new Error('Tried to add. Left was a matrix, but right was neither matrix nor number!')
		}
	} else {
		throw new Error(
			`These types could not be detected for addition: ${Object.getPrototypeOf(
				left
			)} and ${Object.getPrototypeOf(right)}`
		)
	}
	throw new Error(
		`Got to the end of addition, this should never happen!`
	)
}

const emptyEqResults = () => ({
	scalars: new Map<string, Num>(),
	matrices: new Map<string, Matrix>(),
	vecs: new Map<string, Vec>(),
	extras: new Map<string, Extra>(),
	globalMatrixUpdate: <Matrix |null>null,
})

export const eqResults = writable({
	scalars: new Map<string, Num>(),
	matrices: new Map<string, Matrix>(),
	vecs: new Map<string, Vec>(),
	extras: new Map<string, Extra>()
})

export const eqError = writable('')
eqResults.subscribe(console.log)
export function parseEquations() {
    const equationIn = get(equations)
    // console.clear()
	const eqs = equationIn
		.split('\n')
		.filter((eq) => !eq.startsWith('#'))
		.filter((eq) => eq.length)

	try {
		consoleReset()
		const {scalars, vecs, matrices, extras, globalMatrixUpdate} = eqs.reduce((prev, current) => {
			return parse(current, prev.vecs, prev.matrices, prev.scalars, prev.extras, prev.globalMatrixUpdate)
		}, {...(emptyEqResults())})

		// Update the global matrix override
		setGlobalOverrideMatrix(globalMatrixUpdate ? toThree(globalMatrixUpdate) : null)

		eqResults.set({scalars, vecs, matrices, extras})
		eqError.set('')
	} catch (e) {
		// @ts-ignore
		eqError.set(e)
	}
}

let requestParseRef : number = -1
function requestParse() {
	cancelAnimationFrame(requestParseRef)
	requestParseRef = requestAnimationFrame(() => {
		parseEquations()
	})
}

equations.subscribe(() => {
	requestParse()
	
})

slider.subscribe(() => {
	requestParse()
})

// GlobalTweenedMatrix.subscribe(() => {
// 	if (!get(globalMatrixIsBeingOveridden)) parseEquations()
// })