class Utility {
    /**
     * Performs Euclidean division of two numbers.
     * @param a The dividend.
     * @param b The divisor.
     * @returns An object with the quotient and remainder.
     */
    static euclideanDivision(a: number, b: number): { q: number; r: number } {
        const q = Math.floor(a / b);
        let r = a - q * b;

        if (r < 0) {
            return {
                q: q - 1,
                r: r + b,
            };
        }

        return {
            q: q,
            r: r,
        };
    }
}

class PositionVector {
    data: number[];
    modulo: number;
    cycle: number;

    constructor(data: number[], modulo: number = 12, cycle: number = 12) {
        this.data = data;
        this.modulo = modulo;
        this.cycle = cycle;
    }

    element(j: number): number {
        const n = this.data.length;
        const c = this.cycleLength();
        const { q, r } = Utility.euclideanDivision(j, n);
        return this.data[r] + c * q;
    }
    /**
     * Calculates the cycle length based on the maximum element of the position vector.
     * @returns The cycle length.
     */
    private cycleLength(): number {
        const g = Math.max(...this.data);
        const { q } = Utility.euclideanDivision(g, this.modulo);
        return this.modulo * (q + 1);
    }
}
class IntervalVector {
    data: number[];
    modulo: number;
    shift: number;

    /**
     * Initializes an IntervalVector with a sequence of intervals, a modulo for cyclic behavior,
     * and an offset to determine how intervals are shifted. This constructor sets the base properties
     * and defines the relationships between intervals within the vector.
     * @param data An array of intervals that form the vector.
     * @param modulo A cyclic constraint that wraps elements within a specified range.
     * @param shift A shift value applied during certain transformations.
     */
    constructor(data: number[], modulo: number = 12, shift: number = 0) {
        this.data = data;
        this.modulo = modulo;
        this.shift = shift;
    }

    /**
     * Computes the interval element at a given index.
     * @param j The index.
     * @returns The interval element.
     */
    element(j: number): number {
        const n = this.data.length;
        const { r } = Utility.euclideanDivision(j, n);
        return this.data[r];
    }
}
