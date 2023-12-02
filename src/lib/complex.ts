import { Matrix } from "./calculations"

export class Num {
    constructor(public readonly re : number = 0, public readonly im = 0) {
        
    }

    sub(num : Num) {
        return new Num(this.re - num.re, this.im - num.im)
    }

    /**
     * Same as times
     * @param num
     * @returns 
     */
    scale(num : number | Num) {
        return this.times(Num.Create(num))
        // return new Num(this.re * num, this.im * num)
    }

    static Create(num : Num | number) {
        return num instanceof Num ? num : new Num(num)
    }

    add(num : Num) {
        return new Num(this.re + num.re, this.im + num.im)
    }

    minus(num : Num) {
        return new Num(this.re - num.re, this.im - num.im)
    }

    get conjugate() {
        return new Num(this.re, -this.im)
    }

    toString() {
        return this.im === 0 ? this.re : `${this.re} + ${this.im}i`
    }

    /**
     * Returns the modulus of a complex number
     * or simply the absolute value of a real number
     * @returns 
     */
    get absolute() {
        return new Num(Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2)))
    }

    get root() {
        if (this.im === 0) {
            const sqrt = Math.sqrt(this.re)
            if (this.re < 0) {
                return new Num(0, sqrt)
            } else {
                return new Num(sqrt)
            }
        } else {
            throw new Error("complex square roots not implemented yet")
        }
    }

    times(num : Num) {
        const a = this.re
        const b = this.im
        const x = num.re
        const y = num.im
        return new Num((a*x) - (b*y), (b*x) + (a*y))
    }

    pow(amount : number) : Num {
        if (amount === 0) return new Num(1)
        return (this.times(this.pow(amount - 1)))
    }

    get squared() {
        return this.pow(2)
    }
}

export function sum(...args : Num[]) {
    let accre = 0
    let accim = 0
    args.forEach(({re, im}) => {
        accre += re
        accim += im
    })
    return new Num(accre, accim)
}

// @ts-ignore
globalThis.Num = Num
// @ts-ignore
globalThis.sum = sum