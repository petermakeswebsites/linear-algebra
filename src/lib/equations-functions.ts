import { Matrix, Vec, dot } from './calculations'
import { Num } from './complex'
import { ConsoleDeterminant, ConsoleEigenvector, ConsoleValue, consoleAdd } from './console'
import type { AstFunction } from './equations-ast'
import { Eigenvalue } from './equations-extras'
import { eigenvectors } from './matrix-calcs'

function selectFunction(name: string, args: (Matrix | Vec | Num)[]): Matrix | Vec | Num {
	if (name === 'abs') {
		if (args.length !== 1) throw new Error(`Abs function expecting only one argument`)
		const arg = args[0]
		if (arg instanceof Matrix) {
			throw new Error(`Can't find ABS of a matrix`)
		}
		if (arg instanceof Vec) {
			return arg.length
		}
		if (arg instanceof Num) {
			return arg.absolute
		}
		throw new Error(`Argument was neither vector, num, or matrix`)
	} else if (name === 'sin' || name === 'cos' || name === 'tan') {
		if (args.length !== 1) throw new Error(`${name} takes only one argument`)
		const arg = args[0]
		if (arg instanceof Num) {
			if (!arg.isReal)
				throw new Error(
					`Supplied number has imaginary component, ${name} only supports real number`
				)
			return Num.Create(Math[name](arg.re))
		}
		throw new Error(`${name} must be a number`)
	} else if (name === 'sqrt') {
		const allowed = [[Num]] as const
		return generateFunction<typeof allowed, Num>('sqrt', allowed, (num) => num.root, args)
	} else if (name === 'normal') {
		const allowed = [[Vec]] as const
		return generateFunction<typeof allowed, Vec>('normal', allowed, (vec) => vec.normal, args)
	} else if (name === 'det') {
		const allowed = [[Matrix]] as const
		return generateFunction<typeof allowed, Num>(
			'normal',
			allowed,
			(mtx) => {
				const det = mtx.determinant
				consoleAdd(new ConsoleDeterminant(mtx, det))
				return det
			},
			args
		)
	} else if (name === 'eigenvectors') {
		const allowed = [[Matrix]] as const
		return generateFunction<typeof allowed, Matrix>(
			'eigenvectors',
			allowed,
			(mtx) => {
				const vecs = eigenvectors(mtx)
				consoleAdd(new ConsoleEigenvector(vecs[0], vecs[1], mtx))
				return mtx
			},
			args
		)
	} else if (name === 'transpose') {
		const allowed = [[Matrix, Vec]] as const
		return generateFunction<typeof allowed, Matrix>(
			'transpose',
			allowed,
			(vecOrMatrix) => {
				if (vecOrMatrix instanceof Matrix) {
					return vecOrMatrix.transpose
				} else {
					return vecOrMatrix.toMatrix().transpose
				}
			},
			args
		)
	} else if (name === 'log') {
		const allowed = [[Matrix, Vec, Num]] as const
		return generateFunction<typeof allowed, Matrix | Vec | Num>(
			'log',
			allowed,
			(item) => {
				consoleAdd(new ConsoleValue(item))
				return item
			},
			args
		)
	} else if (name === 'length') {
		const allowed = [[Vec]] as const
		return generateFunction<typeof allowed, Num>('length', allowed, (vec) => vec.length, args)
	} else if (name === 'integer') {
		const allowed = [[Vec]] as const
		return generateFunction<typeof allowed, Vec>(
			'integer',
			allowed,
			(vec) => {
				const newVec = vec.toIntegerVec()
				if (newVec === null) throw new Error(`Could not convert to integer`)
				return newVec
			},
			args
		)
	} else if (name === 'angle') {
		const allowed = [[Vec], [Vec]] as const
		return generateFunction<typeof allowed, Num>(
			'angle',
			allowed,
			(vec, vec2) => vec.angleFrom(vec2),
			args
		)
	} else if (name === 'dot') {
		const allowed = [[Vec], [Vec]] as const
		return generateFunction<typeof allowed, Num>(
			'dot',
			allowed,
			(vec, vec2) => dot(vec, vec2),
			args
		)
	} else if (name === 'identity') {
		const allowed = [[Num]] as const
		return generateFunction<typeof allowed, Matrix>(
			'identity',
			allowed,
			(num) => Matrix.identity(num.re),
			args
		)
	} else if (name === 'eigenvalues') {
		if (args.length !== 1) throw new Error(`Eigenvalues function takes only one argument`)
		const arg = args[0]
		if (arg instanceof Matrix) {
			const eigenvalues = new Eigenvalue(arg)
			console.log(eigenvalues.values)
			return arg
		}
		throw new Error(`Eigenvalue argument must be a matrix`)
	} else {
		throw new Error(`Function '${name}' not found!`)
	}
}

type classList = ReadonlyArray<typeof Vec | typeof Num | typeof Matrix>
type AllowedList = ReadonlyArray<classList>

function generateFunction<T extends AllowedList, R extends any>(
	name: string,
	allowedArgs: AllowedList,
	callback: (...args: NestedInstanceUnion<T>) => R,
	args: (Matrix | Vec | Num)[]
) {
	if (args.length !== allowedArgs.length)
		throw new Error(`Function ${name} requires exactly ${allowedArgs.length} arguments`)
	allowedArgs.forEach((allowedList, i) => {
		if (allowedList.every((allowedType) => !(args[i] instanceof allowedType))) {
			throw new Error(
				`Bad type! Expecting any of: ${allowedList.map((t) => t.name).join()} for argument ${i + 1}`
			)
		}
	})

	return callback(...(<NestedInstanceUnion<T>>args))
}

export function parseFunction(
	name: string,
	args: (Matrix | Vec | Num)[],
	negative = false
): Matrix | Vec | Num {
	const result = selectFunction(name, args)
	return negative ? result.scale(-1) : result
}

// Utility type that converts class constructors to their instance types
type InstanceUnion<T extends ReadonlyArray<any>> = T extends readonly [infer First, ...infer Rest]
	? First extends new (...args: any[]) => any
		? InstanceType<First> | InstanceUnion<Rest>
		: never
	: never

// Utility type that applies InstanceUnion to each element of an array of arrays
type NestedInstanceUnion<T extends ReadonlyArray<any>> = {
	[K in keyof T]: T[K] extends ReadonlyArray<any> ? InstanceUnion<T[K]> : never
}
