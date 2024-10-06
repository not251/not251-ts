import { modulo } from "./utility";

//absolute
export default class positionVector {
  data: number[];
  modulo: number;
  span: number;

// Initializes a new PositionVector with the specified data array, modulo, and span. 
// These properties define the vector, where data holds the elements, modulo specifies a cyclical constraint, and span determines the scaling range for the elements.
  constructor(data: number[], modulo: number, span: number) {
    this.data = data;
    this.modulo = modulo;
    this.span = span;
  }

// Retrieves the element at the specified index i in the data array, supporting both positive and negative indices. 
// Uses modular arithmetic to handle wrap-around indexing. 
  element(i: number): number {
    let n = this.data.length;
    let out = 0;
    if (i >= 0) {
      out = this.data[modulo(i, n)] + Math.abs(this.span) * ~~(i / n);
    } else {
      out =
        this.data[modulo(i, n)] + Math.abs(this.span) * (~~((i + 1) / n) - 1);
    }
    return out;
  }

// Creates a new vector by shifting elements starting from the given start index over n elements, incorporating cyclic rotation. 
// Optionally updates the internal data array to the rotated result when autoupdate is true.
  rototranslate(
    start: number,
    n: number = this.data.length,
    autoupdate: boolean = true
  ): positionVector {
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.element(start + i);
    }
    if (autoupdate) this.data = out;

    return new positionVector(out, this.modulo, this.span);
  }

// Recalculates and adjusts the span value to ensure it fully covers the range (difference between maximum and minimum values) of the data array. 
// If the current span is insufficient, it increments by the modulo until it spans the range.
  spanUpdate(): void {
    let maximum = this.data[0];
    let minimum = this.data[0];
    let span = this.modulo;

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] > maximum) {
        maximum = this.data[i];
      }
      if (this.data[i] < minimum) {
        minimum = this.data[i];
      }
    }

    let diff = maximum - minimum;
    if (span <= diff) {
      while (span <= diff) {
        span += this.modulo;
      }
    }
    this.span = span;
  }

// Inverts all elements in the data array by negating their values, effectively flipping the vector around the origin. 
// Returns a new PositionVector with inverted values. Updates the original vector if autoupdate is true.
  invert(autoupdate: boolean = true): positionVector {
    let out = this.data.slice();
    for (let i = 0; i < out.length; i++) {
      out[i] *= -1;
    }
    if (autoupdate) this.data = out;
    return new positionVector(out, this.modulo, this.span);
  }

// Reflects each element in the data array around a specified position. 
// Optionally scales elements up and then down based on "standard", before and after reflection. 
// The reflected values are sorted, and the result is rotated to align with the original vector. Updates data if autoupdate is true.
  negative(
    position: number = 10,
    standard: boolean = true,
    autoupdate: boolean = true
  ): positionVector {
    let out = this.data.slice();
    let pos = position;
    if (standard) {
      for (let i = 0; i < out.length; i++) {
        out[i] *= 2;
      }
      pos = position * 2 - 1;
    }

    for (let i = 0; i < out.length; i++) {
      out[i] -= pos;
    }
    for (let i = 0; i < out.length; i++) {
      out[i] *= -1;
    }
    for (let i = 0; i < out.length; i++) {
      out[i] += pos;
    }

    if (standard) {
      for (let i = 0; i < out.length; i++) {
        out[i] /= 2;
      }
    }
    out.sort(function (a, b) {
      return a - b;
    });

    let outV: positionVector = new positionVector(out, this.modulo, this.span);

    outV.rototranslate(-1);

    if (autoupdate) this.data = out;
    return outV;
  }

// Generates an array of possible PositionVector transformations centered around a given value. 
// Each transformation represents a PositionVector obtained by shifting the elements to new positions relative to the center, cycling through both left and right rotations.
  options(center: number): positionVector[] {
    let map: positionVector[] = [];
    let n = this.data.length;

    for (let i = center - n; i < center + n; i++) {
      const option = this.rototranslate(i, n, false);
      map.push(option);
    }
    return map;
  }

// Creates a new PositionVector by selecting elements from the current vector based on indices provided by another PositionVector. 
// The resulting vector is then adjusted for its range by recalculating the span.
  selectFromPosition(p: positionVector) {
    let v: number[] = [];
    for (let i = 0; i < p.data.length; i++) {
      v.push(this.element(p.data[i]));
    }
    let out = new positionVector(v, this.modulo, this.span);
    out.spanUpdate();
    return out;
  }

// Inverts the vector around a specific axis, which can be the first element (0), last element (2), or the middle element (default). 
// Returns a new vector with elements mirrored around the chosen axis. If the median (1) is selected, the data is simply reversed.
  freeInvert(axis: number = 1): positionVector {
    if (this.data.length === 0) {
      return this; // Return empty vector if the data is empty
    }

    let out: number[] = new Array(this.data.length);

    switch (axis) {
      case 0: {
        // First element
        const axisValue = this.data[0];
        for (let i = 0; i < this.data.length; i++) {
          out[i] = 2 * axisValue - this.data[i];
        }
        break;
      }
      case 2: {
        // Last element
        const axisValue = this.data[this.data.length - 1];
        for (let i = 0; i < this.data.length; i++) {
          out[i] = 2 * axisValue - this.data[i];
        }
        break;
      }
      case 1:
      default:
        // Median case: reverse the array
        out = this.data.slice().reverse();
        break;
    }

    return new positionVector(out, this.modulo, this.span);
  }
}
