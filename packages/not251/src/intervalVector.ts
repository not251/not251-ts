import { modulo, lcm } from "./utility";

/**
 * Represents a cyclic vector of intervals, supporting transformations like rotation, inversion, and reflection.
 * Defined by elements (data), a modulo constraint for cyclic properties, and an offset for shifting operations.
 */
export class intervalVector {
  data: number[];
  modulo: number;
  offset: number;

  /**
   * Initializes an IntervalVector with a sequence of intervals, a modulo for cyclic behavior,
   * and an offset to determine how intervals are shifted. This constructor sets the base properties
   * and defines the relationships between intervals within the vector.
   * @param data An array of intervals that form the vector.
   * @param modulo A cyclic constraint that wraps elements within a specified range.
   * @param offset A shift value applied during certain transformations.
   */
  constructor(data: number[], modulo: number = 12, offset: number = 0) {
    // Ensure data is always number[] even if input might contain undefined somehow
    this.data = data.filter((v): v is number => v !== undefined);
    this.modulo = modulo;
    this.offset = offset;
  }

  /**
   * Retrieves the interval at a specified index, applying modular arithmetic to handle indices
   * that exceed the vector's bounds by wrapping around cyclically.
   * @param i The index of the interval to retrieve, allowing negative values for reverse indexing.
   * @returns The interval at the given index, adjusted for cyclic behavior, or 0 if data is empty.
   */
  element(i: number): number {
    // FIX: Handle empty data array to avoid modulo by zero and undefined result (TS2322)
    if (this.data.length === 0) {
        return 0; // Or throw an error, depending on desired behavior
    }
    // Use non-null assertion assuming modulo logic prevents out-of-bounds if length > 0
    return this.data[modulo(i, this.data.length)]!;
  }

  /**
   * Rotates the vector by selecting a sequence of intervals starting from a given index,
   * cycling through 'n' elements, and returning the rotated sequence as a new IntervalVector.
   * If autoupdate is true, the original data array is updated with the rotated sequence.
   * @param r The starting index for rotation.
   * @param n The number of elements to include in the rotation (defaults to the entire vector).
   * @param autoupdate If true, updates the original data with the rotated sequence (default is true).
   * @returns A new IntervalVector representing the rotated sequence.
   */
  rotate(
    r: number,
    n: number = this.data.length,
    autoupdate: boolean = true
  ): intervalVector {
    // FIX: Initialize 'out' explicitly as number[]
    let out: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      // element() now returns number, so assignment is safe
      out[i] = this.element(r + i);
    }
    if (autoupdate) this.data = out; // 'out' is now number[]
    return new intervalVector(out, this.modulo, this.offset);
  }

  /**
   * Inverts the sequence of intervals by reversing their order, effectively flipping the vector.
   * A new IntervalVector with the reversed order is returned, and if autoupdate is true,
   * the original data array is updated with the inverted order.
   * @param autoupdate If true, updates the original data array with the inverted sequence (default is true).
   * @returns A new IntervalVector with the intervals in reverse order.
   */
  invert(autoupdate: boolean = true): intervalVector {
    let n = this.data.length;
    // FIX: Initialize 'out' explicitly as number[]
    let out: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      // FIX: Use non-null assertion assuming index is valid (TS2322)
      out[i] = this.data[n - 1 - i]!;
    }
    // FIX: 'out' is now number[], assignment is safe (TS2322)
    if (autoupdate) this.data = out;
    return new intervalVector(out, this.modulo, this.offset);
  }

  /**
   * Reflects elements either towards or away from a specified position within the vector.
   * When 'left' is true, intervals up to the position are mirrored inwards, otherwise elements
   * from the position to the end are reflected outwards. This creates a new IntervalVector
   * with mirrored elements, and if autoupdate is true, updates the original data with the mirrored result.
   * @param position The position around which the reflection is performed.
   * @param left Determines the direction of reflection: true for left side, false for right side.
   * @param autoupdate If true, updates the original data array with the mirrored sequence (default is true).
   * @returns A new IntervalVector with reflected elements based on the specified position and direction.
   */
  singleMirror(
    position: number,
    left: boolean,
    autoupdate: boolean = true
  ): intervalVector {
    // FIX: Work on a copy to avoid modifying original if autoupdate is false
    let out = [...this.data];
    let n = out.length;
    // Ensure position is valid even if n is 0
    position = n > 0 ? modulo(position, n) : 0;

    if (left) {
      for (let i = 0; i < position / 2; ++i) {
        // FIX: Use non-null assertions for swap assuming indices are valid (TS2322)
        let temp = out[i]!;
        out[i] = out[position - 1 - i]!;
        out[position - 1 - i] = temp;
      }
    } else {
      let end = position + (n - position) / 2;
      for (let i = position; i < end; ++i) {
        // FIX: Use non-null assertions for swap assuming indices are valid (TS2322)
        let temp = out[i]!;
        out[i] = out[n - 1 - (i - position)]!;
        out[n - 1 - (i - position)] = temp;
      }
    }
    if (autoupdate) this.data = out;

    return new intervalVector(out, this.modulo, this.offset);
  }
}

/**
 * Calculates the LCM of two intervalVector instances and scales their data, modulo and offset accordingly.
 *
 * @param a - The first intervalVector instance.
 * @param b - The second intervalVector instance.
 * @returns A tuple containing two intervalVector instances scaled to the same modulo.
 */
export function lcmInterval(
  a: intervalVector,
  b: intervalVector
): [intervalVector, intervalVector] {
  if (a.modulo === b.modulo) {
    return [a, b];
  }
  let c = lcm(a.modulo, b.modulo);
  let d: number[] = []; // Explicitly type as number[]
  for (let i = 0; i < a.data.length; i++) {
    // FIX: Use non-null assertion assuming a.data[i] is number (TS2532)
    d.push((c / a.modulo) * a.data[i]!);
  }
  let e: number[] = []; // Explicitly type as number[]
  for (let i = 0; i < b.data.length; i++) {
    // FIX: Use non-null assertion assuming b.data[i] is number (TS2532)
    e.push((c / b.modulo) * b.data[i]!);
  }
  return [
    new intervalVector(d, c, (c / a.modulo) * a.offset),
    new intervalVector(e, c, (c / b.modulo) * b.offset),
  ];
}
