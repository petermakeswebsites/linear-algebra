import { dot, Matrix, type Vec } from './calculations'
import type { Num } from './complex'
import { eigenvalues } from './matrix-calcs'

export class Extra {
	constructor() {}
}

/**
 * The area of a parallelopiped is a triple dot product
 */
export class Parallelopiped extends Extra {
	constructor(public readonly vec1: Vec, public readonly vec2: Vec, public readonly vec3: Vec) {
        super()
    }

    get volume() {
        return dot(this.vec1, this.vec2.cross(this.vec3))
    }
}

/**
 * The area of a parallelopiped is a triple dot product
 */
export class Eigenvalue extends Extra {
    public readonly values : [Num, Num]
	constructor(public readonly matrix : Matrix) {
        super()
        this.values = eigenvalues(matrix)
    }
}

export class Angle extends Extra {
    public readonly angleNormal : [Num, Num]
	constructor(public readonly matrix : Matrix) {
        super()
        this.values = eigenvalues(matrix)
    }
}
