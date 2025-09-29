import { round } from 'lodash-es'

function roundToNearestEpsilon(val: number) {
	const rounded = round(val, 0.1)
	const difference = Math.abs(val - rounded)
	return Math.abs(difference) < Number.EPSILON ? rounded : val
}

export class Num {
	constructor(public readonly re: number = 0, public readonly im = 0) {
		this.re = roundToNearestEpsilon(re)
		this.im = roundToNearestEpsilon(im)
	}

	sub(num: Num) {
		return new Num(this.re - num.re, this.im - num.im)
	}

	sanitised(num: Num) {
		return new Num(num.re)
	}

	get isNegative() {
		return this.re < 0
	}

	/**
	 * Same as times
	 * @param num
	 * @returns
	 */
	scale(num: number | Num) {
		return this.times(Num.Create(num))
		// return new Num(this.re * num, this.im * num)
	}

	static Create(num: Num | number) {
		return num instanceof Num ? num : new Num(num)
	}

	add(num: Num) {
		return new Num(this.re + num.re, this.im + num.im)
	}

	minus(num: Num) {
		return new Num(this.re - num.re, this.im - num.im)
	}

	divideBy(num: Num) {
		return this.times(num.inverse)
	}

	get conjugate() {
		return new Num(this.re, -this.im)
	}

	toString(precision = 2) {
		return this.im === 0
			? round(this.re, precision)
			: `${round(this.re, precision)} + ${round(this.im, precision)}i`
	}

	print() {
		console.log(this.toString())
	}

	// Only checks the real part
	isInteger() {
		return this.re % 1 === 0 && this.im % 1 === 0
	}

	equalTo(num: Num | number) {
		const comparitor = Num.Create(num)
		return this.re === comparitor.re && this.im === comparitor.im
	}

	equalToTolerance(num: Num | number, tolerance = Number.EPSILON) {
		const comparitor = Num.Create(num)
		return (
			Math.abs(this.re - comparitor.re) < tolerance && Math.abs(this.im - comparitor.im) < tolerance
		)
	}

	get isReal() {
		return this.im === 0
	}

	get isRealInteger() {
		return this.isReal && Math.floor(this.re) === this.re
	}

	/**
	 * Throws if div/0
	 */
	get inverse() {
		const denom = this.re * this.re + this.im * this.im
		if (denom === 0) throw new Error(`Attempting to divide by zero!`)
		return this.conjugate.scale(1 / denom)
	}

	/**
	 * Returns the modulus of a complex number
	 * or simply the absolute value of a real number
	 * @returns
	 */
	get absolute() {
		return new Num(Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2)))
	}

	/**
	 * Only square roots real one
	 */
	get root() {
		if (this.im === 0) {
			const sqrt = Math.sqrt(this.re)
			if (this.re < 0) {
				return new Num(0, sqrt)
			} else {
				return new Num(sqrt)
			}
		} else {
			throw new Error('complex square roots not implemented yet')
		}
	}

	times(num: Num) {
		const a = this.re
		const b = this.im
		const x = num.re
		const y = num.im
		return new Num(a * x - b * y, b * x + a * y)
	}

	get isZero() {
		return this.re === 0 && this.im === 0
	}

	static Zero() {
		return new Num(0)
	}

	pow(amount: number): Num {
		if (amount === 0) return new Num(1)
		return this.times(this.pow(amount - 1))
	}

	get squared() {
		return this.pow(2)
	}
}

export function sum(...args: Num[]) {
	let accre = 0
	let accim = 0
	args.forEach(({ re, im }) => {
		accre += re
		accim += im
	})
	return new Num(accre, accim)
}

export function quadraticRoots(a: Num, b: Num, c: Num): [Num, Num] {
	if (a.equalTo(0)) throw new Error(`Quadratic formula requires non-zero 'a' value`)
	const discriminant = b.squared.minus(Num.Create(4).times(a.times(c)))
	const minusB = b.scale(-1)
	const firstRoot = minusB.add(discriminant.root).divideBy(a.scale(2))
	const secondRoot = minusB.minus(discriminant.root).divideBy(a.scale(2))
	return [firstRoot, secondRoot]
}

// export function cubicRoots(a : Num, b : Num, c : Num, d : Num) : [Num, Num, Num] {

// 	const b3over27a3 = divide(multiply(pow(B, 3), -1), multiply(27, pow(A, 3)))
// 	const bcover6a2 = divide(multiply(B,C), multiply(6, pow(A, 2)))
// 	const dover2a = divide(D, multiply(2, A))

// 	const mainPart = subtract(add(b3over27a3, bcover6a2), dover2a)

// 	const cover3a = divide(C, multiply(3, A))
// 	const b2over9a2 = divide(pow(B,2), multiply(9, pow(A,2)))

// 	const smallerPart = subtract(cover3a, b2over9a2)

// 	const innerRoot = nthRoots(add(pow(mainPart,2), pow(smallerPart, 3)) as Complex,2)

// 	const firstLine = nthRoots(add(mainPart,  innerRoot) as Complex, 3)
// 	const secondLine = nthRoots(subtract(mainPart,  innerRoot) as Complex, 3)
// 	const bover3a = divide(B, multiply(3, A))

// 	const final = subtract(add(firstLine, secondLine), bover3a)
// 	console.log(final)
// }

// @ts-ignore
// globalThis.cubicRoots = cubicRoots

export function factorial(n: number) {
	if (n == 0) return 1
	let acc = n
	while (n > 1) {
		n--
		acc = acc * n
	}
	return acc
}

// exp
// export function exp(x : Num, iterations = 5) {
// 	let sum = Num.Zero()
// 	let n = 0
// 	while (n < iterations) {
// 		const fac = new Num(factorial(n))
// 		const numerator = x.pow(n)
// 		sum = sum.add(numerator.divideBy(fac))
// 		n++
// 	}
// 	return sum
// }

// export function mexp(x : Num, iterations = 15) : Num {
// 	const mx = complex(0, pi*8)
// 	let sum = complex(0)
// 	let n = 0

// 	while (n < iterations) {
// 		const fac = factorial(n)
// 		const numerator = pow(mx, complex(n))
// 		sum = add(sum, divide(numerator, complex(fac, 0))) as Complex
// 		n++
// 	}
// 	return new Num(sum.re,sum.im)
// }

// export function ln(x : Num, iterations = 5) {
// 	let sum = Num.Zero()
// 	let n = 0
// 	while (n < iterations) {
// 		const fac = Comfactorial(n))
// 		const numerator = x.pow(n)
// 		sum = sum.add(numerator.divideBy(numerator, fac))
// 		n++
// 	}
// 	return sum
// }

// @ts-ignore
// globalThis.pi = pi

//@ts-ignore
// globalThis.complex = complex
//@ts-ignore
// globalThis.exp = exp
//@ts-ignore
// globalThis.factorial = factorial

// @ts-ignore
globalThis.Num = Num
// @ts-ignore
globalThis.sum = sum
