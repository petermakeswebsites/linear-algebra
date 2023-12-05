import { chunk, every, indexOf, min, times, zipWith } from 'lodash-es'
import { sum, Num } from './complex'

export class Matrix {
	/**
	 * Rows, number of horizontal units, number of dimensions in each vector
	 */
	m: number
	get rows() {
		return this.m
	}
	/**
	 * Cols, number of vertical units, number of vecs in the matrix
	 */
	n: number
	get cols() {
		return this.n
	}
	constructor(public readonly vecs: Vec[]) {
		if (vecs.length < 1) throw new Error('Zero vectors returned')
		const originalDimensions = vecs[0].dimensions
		if (!vecs.every((vec) => vec.dimensions === originalDimensions))
			throw new Error('Vectors had different dimensions creating a matrix')
		this.m = originalDimensions
		this.n = vecs.length
	}

	/**
	 * Returns val
	 * @param row 1 = first row
	 * @param col 1 = first col
	 */
	get(row: number, col: number) {
		if (row > this.m || row < 1) throw new Error(`Row ${row} out of range ${1} to ${this.m}`)
		if (col > this.n || col < 1) throw new Error(`Column ${col} out of range ${1} to ${this.n}`)
		return this.vecs[col - 1].values[row - 1]
	}

	get square() {
		return this.m === this.n
	}

	get determinant(): Num {
		if (!this.square) throw new Error('Attempting to find determinant for a non-square matrix!')
		// A single number
		if (this.n === 1) {
			return this.get(1, 1)
		} else if (this.n >= 1) {
			let acc = new Num(0, 0)
			const row = 1
			for (let col = 1; col <= this.n; col++) {
				const ele = this.get(row, col)
				const cofactor = Matrix.cofactor(row, col)
				const minor = this.minor(row, col)
				acc = acc.add(ele.times(cofactor.times(minor.determinant)))
			}
			return acc
		} else {
			throw new Error('The number of dimensions was less than 1, this should be impossible')
		}
	}

	sameDimensionsAs(mtx: Matrix) {
		return mtx.cols === this.cols && mtx.rows === this.rows
	}

	add(mtx: Matrix) {
		if (!this.sameDimensionsAs(mtx)) throw new Error('Dimensions mismatch -- cannot add')
		const mtxArr = mtx.numberArray()
		const thisArr = this.numberArray()
		const newArr = zipWith(mtxArr, thisArr, (a, b) => a.add(b))
		return Matrix.fromNumberArray(newArr, this.cols)
	}

	get size() {
		return `${this.rows}x${this.cols}`
	}

	get inverse() {
		if (!this.square) throw new Error(`Attempting to get an inverse of a non-square matrix`)
		const det = this.determinant
		if (det.equalTo(0)) throw new Error(`Matrix is not invertible, determinant is 0`)

		const columns: Vec[] = []
		this.#cycleCols((col) => {
			const columnarValues: Num[] = []
			this.#cycleRows((row) => {
				const minor = this.minor(row, col)
				const cofactor = Matrix.cofactor(row, col)
				columnarValues.push(minor.determinant.times(cofactor))
			})
			columns.push(new Vec(columnarValues))
		})
		const mtx = new Matrix(columns)
		return mtx.transpose.scale(det.inverse)
	}

	times(matrix: Matrix) {
		if (matrix.rows !== this.cols)
			throw new Error(`Cannot multiply matrices. Left is ${this.size} but right is ${matrix.size}`)
		const targetRows = this.rows
		const targetCols = matrix.cols
		return new Matrix(
			times(targetCols, (i) => {
				const col = i + 1
				return new Vec(
					times(targetRows, (j) => {
						const row = j + 1
						const calculateColumn = matrix.getCol(col)
						const calculateRow = this.getRow(row).transpose
						return dot(calculateColumn, calculateRow)
					})
				)
			})
		)
	}

	pow(num: number): Matrix {
		if (!this.square) throw new Error(`Can only raise to the power of a square matrix`)
		if (Math.floor(num) !== num) throw new Error(`Cannot raise matrix to the power of a fraction`)
		if (num === 0) return Matrix.identity(this.rows)
		if (num < 0) return this.pow(Math.abs(num)).inverse
		return this.times(this.pow(num - 1))
	}

	scale(num: Num | number) {
		const mult = Num.Create(num)
		const newArray = this.numberArray().map((t) => t.times(mult))
		return Matrix.fromNumberArray(newArray, this.cols)
	}

	getRow(row: number) {
		if (row > this.m || row < 1) throw new Error(`Row ${row} out of range ${1} to ${this.m}`)
		return new Matrix(this.vecs.map((vec) => new Vec([vec.component(row)])))
	}

	getCol(col: number) {
		if (col > this.n || col < 1) throw new Error(`Column ${col} out of range ${1} to ${this.n}`)
		return new Matrix(this.vecs.filter((_, i) => col === i + 1))
	}

	get trace(): Num {
		if (!this.square) throw new Error('Attempted to get trace but not a square matrix')
		let acc = new Num()
		for (let col = 1; col <= this.n; col++) {
			acc = acc.add(this.get(col, col))
		}
		return acc
	}

	/**
	 *
	 * @param col number (1 = first)
	 */
	removeCol(col: number) {
		if (col < 1) throw new RangeError(`Column ${col} less than 1`)
		if (col > this.n) throw new RangeError(`Column ${col} more than columns in matrix ${this.n}`)

		return new Matrix(this.vecs.filter((_, i) => !(i == col - 1)))
	}

	removeRow(row: number) {
		if (row < 1) throw new RangeError(`Row ${row} less than 1`)
		if (row > this.m) throw new RangeError(`Row ${row} more than rows in matrix ${this.m}`)
		const newVecs = this.vecs.map((vec) => vec.removeDimension(row))
		return new Matrix(newVecs)
	}

	minor(row: number, col: number) {
		return this.removeRow(row).removeCol(col)
	}

	static cofactor(row: number, col: number) {
		return new Num(-1, 0).pow(row + col)
	}

	static fromVecArray(...vecs: number[][]): Matrix {
		return new Matrix(
			vecs.map((vec) => {
				return Vec.fromNumberArray(vec)
			})
		)
	}

	get transpose(): Matrix {
		const colAcc: Vec[] = []
		for (let row = 1; row <= this.m; row++) {
			const rowAcc: Num[] = []
			for (let col = 1; col <= this.n; col++) {
				rowAcc.push(this.get(row, col))
			}
			colAcc.push(new Vec(rowAcc))
		}
		return new Matrix(colAcc)
	}

	get rowStrings() {
		let rowStrings: string[] = []
		for (let row = 1; row <= this.m; row++) {
			let acc = ''
			for (let col = 1; col <= this.n; col++) {
				const num = this.get(row, col)
				acc += num.toString() + (col !== this.n ? ', ' : '')
			}
			rowStrings.push(acc)
		}
		return rowStrings
	}

	toVec(): Vec {
		if (this.vecs.length !== 1)
			throw new Error(
				`Attempted to convert matrix to vector but there was ${this.vecs.length} cols`
			)
		return this.vecs[0]
	}

	print() {
		console.group(`Matrix ${this.n} x ${this.m}`)
		this.rowStrings.forEach((str) => console.log(str))
		console.groupEnd()
	}

	toString() {
		let acc = ''
		for (let row = 1; row <= this.m; row++) {
			for (let col = 1; col <= this.n; col++) {
				const num = this.get(row, col)
				acc += num.toString() + (col !== this.n ? ', ' : '')
			}
			if (row !== this.m) acc += '\n'
		}
		return acc
	}

	static identity(n: number) {
		return new Matrix(
			times(n, (i) => {
				return new Vec(
					times(n, (j) => {
						return new Num(i === j ? 1 : 0)
					})
				)
			})
		)
	}

	numberArray(): Num[] {
		return this.vecs.flatMap((vec) => vec.values)
	}

	realNumberArray(): number[] {
		return this.vecs.flatMap((vec) => vec.toRealArray())
	}

	setNumberInArray(index: number, value: number | Num) {
		const numbers = this.numberArray()
		numbers[index] = Num.Create(value)
		Num.Create(value)
		return Matrix.fromNumberArray(numbers, this.cols)
	}

	get copy() {
		return new Matrix([...this.vecs])
	}

	static fromRealNumberArray(numbers: number[], colLength: number) {
		const chunks = chunk(numbers, colLength)
		if (!every(chunks, ({ length }) => length === chunks[0].length))
			throw new Error(`Not all lengths are equal, got ${numbers.length} split in ${colLength}`)
		return new Matrix(chunks.map((chunk) => Vec.fromNumberArray(chunk)))
	}
	static fromNumberArray(numbers: Num[], colLength: number) {
		const chunks = chunk(numbers, colLength)
		if (!every(chunks, ({ length }) => length === chunks[0].length))
			throw new Error(`Not all lengths are equal, got ${numbers.length} split in ${colLength}`)
		return new Matrix(chunks.map((chunk) => new Vec(chunk)))
	}

	#cycleRows<T>(row: (row: number) => T): T[] {
		return times(this.rows, (i) => row(i + 1))
	}

	#cycleCols<T>(col: (col: number) => T): T[] {
		return times(this.cols, (i) => col(i + 1))
	}

	#cycleAllElements<T>(callback: (row: number, col: number) => T): T[] {
		return this.#cycleRows((row) => {
			return this.#cycleCols((col) => {
				return callback(row, col)
			})
		}).flatMap((v) => v)
	}
	get isUpperTriangular() {
		const nums: Num[] = []
		this.#cycleAllElements((row, col) => {
			if (row > col) nums.push(this.get(row, col))
		})
		if (nums.length === 0) throw new Error(`???`)
		return nums.every((num) => num.equalTo(0))
	}

	get isLowerTriangular() {
		const nums: Num[] = []
		this.#cycleAllElements((row, col) => {
			if (col > row) nums.push(this.get(row, col))
		})
		if (nums.length === 0) throw new Error(`???`)
		return nums.every((num) => num.equalTo(0))
	}
	get isDiagonal() {
		const nums: Num[] = []
		this.#cycleAllElements((row, col) => {
			if (col != row) nums.push(this.get(row, col))
		})
		if (nums.length === 0) throw new Error(`???`)
		return nums.every((num) => num.equalTo(0))
	}
}

export class Vec {
	constructor(public readonly values: Num[]) {}
	get dimensions() {
		return this.values.length
	}

	toRealArray() {
		return this.values.map((num) => num.re)
	}

	/**
	 * component 1 = first component
	 */
	modifyComponent(component: number, newNum: number | Num) {
		const num = Num.Create(newNum)
		if (this.dimensions < component) throw new RangeError('Attempted to modify component too far')
		if (component <= 0) throw new RangeError(`Component too low, must be 1 or greater`)
		const newVals = [...this.values]
		newVals[component - 1] = num
		return new Vec(newVals)
	}

	cross(vec: Vec) {
		if (this.dimensions !== 3)
			throw new Error(`Cross multiplication is only for 3d vectors, this one is ${this.dimensions}`)
		if (vec.dimensions !== 3)
			throw new Error(`Cross multiplication is only for 3d vectors, target is ${vec.dimensions}`)

		// Create a matrix of these three
		const mtx = new Matrix([Vec.fromNumberArray([0, 0, 0]), this, vec]).transpose
		return new Vec([
			mtx.minor(1, 1).determinant,
			mtx.minor(1, 2).determinant.scale(-1),
			mtx.minor(1, 3).determinant
		])
	}

	add(vec: Vec) {
		if (vec.dimensions !== this.dimensions)
			throw new Error(`Dimension mismatch: ${this.dimensions}, ${vec.dimensions}`)
		return new Vec(
			this.values.map((val, i) => {
				return vec.values[i].add(val)
			})
		)
	}

	subtract(vec: Vec) {
		return this.add(vec.scale(-1))
	}

	scale(scalar: Num | number) {
		return new Vec(
			this.values.map((val) => {
				return val.times(Num.Create(scalar))
			})
		)
	}

	static Zero(dimensions: number) {
		return new Vec(new Array(dimensions).fill(new Num()))
	}

	get toThreeDimensions() : Vec {
		if (this.dimensions === 3) return this
		if (this.dimensions === 2) return new Vec([...this.values, Num.Zero()])
		if (this.dimensions === 1) return new Vec([...this.values, Num.Zero(),Num.Zero()])
		throw new Error(`Attempted to upgrade vector to three dimesnions but it was not a 1, 2, or 3 dimensional vector. It had ${this.dimensions} dimensions.`)
	}

	toMatrix() {
		return new Matrix([this])
	}

	component(dimension: number) {
		if (dimension < 1) throw new RangeError(`Dimensions ${dimension} is less than 1`)
		if (dimension > this.values.length)
			throw new RangeError(
				`Dimensions ${dimension} is more than the vector dimensions ${this.dimensions}`
			)
		return this.values[dimension - 1]
	}

	removeDimension(dimension: number) {
		if (dimension < 1) throw new RangeError(`Dimension ${dimension} less than 1`)
		if (dimension > this.dimensions)
			throw new RangeError(
				`Dimension ${dimension} more than dimensions of vector ${this.dimensions}`
			)
		const newArr = [...this.values]
		newArr.splice(dimension - 1, 1)
		return new Vec(newArr)
	}

	toIntegerVec() {
		return vecInteger(this)
	}

	equals(vec: Vec) {
		if (vec.dimensions !== this.dimensions) return false
		return vec.values.map((num, i) => this.values[i].equalToTolerance(num)).every(t => t === true)
	}

	isSamedirectionAs(vec : Vec) {
		const thisNormal = this.normal
		const vecNormal = vec.normal
		return (thisNormal.equals(vecNormal) || thisNormal.scale(-1).equals(vecNormal))
	}

	get i() {
		return this.component(1)
	}
	get j() {
		return this.component(2)
	}
	get k() {
		return this.component(3)
	}

	angleFrom(b: Vec) {
		return angleBetween(this, b)
	}

	static fromNumberArray(numbers: number[]) {
		return new Vec(numbers.map((num) => new Num(num)))
	}

	get length() {
		return sum(...this.values.map((num) => num.pow(2))).root
	}

	toString() {
		return `[${this.values.map((v) => v.toString()).join()}]`
	}

	get normal() {
		return normal(this)
	}

	print() {
		console.log(this.toString())
	}
}

export function dot(a: Matrix | Vec, b: Matrix | Vec) {
	const avec = a instanceof Matrix ? a.toVec() : a
	const bvec = b instanceof Matrix ? b.toVec() : b
	if (avec.dimensions !== bvec.dimensions)
		throw new Error(
			`The two vectors did not match dimensions in dot product (${avec.dimensions}, ${bvec.dimensions})`
		)
	let acc = new Num()
	times(avec.dimensions, (i) => (acc = acc.add(avec.component(i + 1).times(bvec.component(i + 1)))))
	return acc
}

// export class Vec1 extends Vec {
//     constructor(public readonly i : Num) {
//         super([i])
//     }

//     toMatrix() {
//         return new Matrix([this])
//     }
// }

// export class Vec2 extends Vec {
//     constructor(public readonly i : Num, public readonly j : Num) {
//         super([i,j])
//     }

//     toMatrix() {
//         return new Matrix([this])
//     }
// }

// export class Vec3 extends Vec {
//     constructor(public readonly i : Num, public readonly j : Num, public readonly k : Num) {
//         super([i,j,k])
//     }

//     toMatrix() {
//         return new Matrix([this])
//     }
// }

/**
 * Only returns the real component
 * @param a
 * @param b
 * @returns
 */
function angleBetween(a: Vec, b: Vec): Num {
	if (a.dimensions !== b.dimensions)
		throw new Error(`Vectors are of a different order ${a.dimensions} vs ${b.dimensions}`)
	/**
	 * A dot B = |A| |B| cos(theta)
	 * cos(theta) = (A dot B)/(|A| * |B|)
	 * theta = asin((A dot B)/(|A| * |B|))
	 */
	const denominator = a.length.times(b.length)
	if (denominator.isZero) throw new Error(`One of the vectors is a zero vector!`)
	return new Num(Math.acos(dot(a, b).divideBy(denominator).re))
}

function normal(a: Vec): Vec {
	const len = a.length
	if (len.isZero) throw new Error(`Vector must have a length in order to normalize`)
	return a.scale(len.inverse)
}

export function matrixTweener(current: Matrix, target: Matrix) {
	if (current.cols !== target.cols)
		throw new Error('Matrix and current matrix have different column numbers')
	if (current.rows !== target.rows) throw new Error('Matrix and current matrix have row numbers')
	const numbers = current.numberArray()
	const targetNumbers = target.numberArray()
	const differences = numbers.map((original, i) => targetNumbers[i].minus(original))
	const colSplit = current.cols
	/**
	 * t is 0 to 1
	 */
	return (t: number) => {
		const nums: Num[] = []
		for (let index = 0; index < numbers.length; index++) {
			const start = numbers[index]
			const end = targetNumbers[index]
			nums.push(start.add(differences[index].scale(t)))
		}
		return Matrix.fromNumberArray(nums, colSplit)
	}
}

/**
 * Scales the vec so that it has all integer components.
 * Also takes imaginary into account.
 *
 * Returns the original vec otherwise
 * @param vec
 * @param limit
 */
function vecInteger(vec: Vec, limit = 100): Vec | null {
	// Scale the vector such that the smallest vector equals one
	const nonZeroNums = vec.values.flatMap((num) => [num.re, num.im]).filter((num) => num !== 0)
	if (nonZeroNums.length === 0) return vec

	// Will be non-zero
	const smallestNumber = min(nonZeroNums)
	if (smallestNumber === undefined) throw new Error(`Smallest number was not defined in vector`)

	// We will scale the vec so the smallest number is 1
	const newVec = vec.scale(1 / smallestNumber)
	// console.log(newVec.values)
	for (let i = 1; i < limit; i++) {
		const processed = newVec.scale(i)
		if (processed.values.every((num) => num.isInteger())) return processed
	}
	return null
}

// @ts-ignore
globalThis.Matrix = Matrix
// @ts-ignore
globalThis.Vec = Vec
// @ts-ignore
globalThis.dot = dot

// @ts-ignore
globalThis.A = Matrix.fromVecArray([1, 2, 3])
// @ts-ignore
globalThis.B = Matrix.fromVecArray([1, 2, 3]).transpose

//@ts-ignore
globalThis.skew = Matrix.fromVecArray([0, 0, 0], [0, 1, 0], [0, 0, 0])
