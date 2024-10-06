import { modulo } from "./utility";

//relative
export default class intervalVector {
  data: number[];
  modulo: number;
  offset: number;

// Initializes an IntervalVector with an array of intervals (data), along with the modulo (cyclic constraint) and offset (shift value). 
// Defines the basic properties and interval relationships.
  constructor(data: number[], modulo: number, offset: number) {
    this.data = data;
    this.modulo = modulo;
    this.offset = offset;
  }

// Retrieves the element at the specified index, cycling through the data array using modular arithmetic to wrap around indices beyond the array's length.
  element(i: number): number {
    return this.data[modulo(i, this.data.length)];
  }

// Rotates the vector starting from a specified index r, continuing for n elements, and returning the rotated result as a new IntervalVector. 
// If autoupdate is true, the internal data array is updated to the rotated sequence.
  rotate(
    r: number,
    n: number = this.data.length,
    autoupdate: boolean = true
  ): intervalVector {
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.element(r + i);
    }
    if (autoupdate) this.data = out;
    return new intervalVector(out, this.modulo, this.offset);
  }

// Reverses the order of intervals in the data array, effectively inverting the sequence. 
// A new IntervalVector with the inverted order is returned, and if autoupdate is true, updates the internal data to the inverted order.
  invert(autoupdate: boolean = true): intervalVector {
    let n = this.data.length;
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.data[n - 1 - i];
    }
    if (autoupdate) this.data = out;
    return new intervalVector(out, this.modulo, this.offset);
  }

// Reflects elements either to the left or right of a specified position. 
// If left is true, elements up to position are mirrored inwards; otherwise, elements from position to the end are reflected outwards. 
// The result is a mirrored IntervalVector, updating data if autoupdate is true.
  singleMirror(
    position: number,
    left: boolean,
    autoupdate: boolean = true
  ): intervalVector {
    let out = this.data; // Copy the array
    let n = out.length;
    position = modulo(position, n);

    if (left) {
      for (let i = 0; i < position / 2; ++i) {
        let temp = out[i];
        out[i] = out[position - 1 - i];
        out[position - 1 - i] = temp;
      }
    } else {
      let end = position + (n - position) / 2;
      for (let i = position; i < end; ++i) {
        let temp = out[i];
        out[i] = out[n - 1 - (i - position)];
        out[n - 1 - (i - position)] = temp;
      }
    }
    if (autoupdate) this.data = out;

    return new intervalVector(out, this.modulo, this.offset);
  }
}
