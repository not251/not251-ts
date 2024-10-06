import positionVector from "./positionVector";
import intervalVector from "./intervalVector";

// Converts an IntervalVector into a PositionVector. 
// Starts from an initial offset value and iteratively sums the intervals, storing cumulative sums in the out array to represent the resulting positions. 
// The final sum, adjusted by the initial offset, determines the span for the new PositionVector.
export function toPositions(s: intervalVector): positionVector {
  let n = s.data.length;
  let out = new Array(n);
  let sum = s.offset;
  for (let i = 0; i < n; i++) {
    out[i] = sum;
    sum += s.data[i];
  }
  sum -= s.offset;
  return new positionVector(out, s.modulo, sum);
}

// Converts a PositionVector into an IntervalVector. 
// Calculates the interval between consecutive elements in the data array by finding the difference between each element and its successor. 
// These differences are stored in the out array as intervals, which form the IntervalVector. The first element of data sets the initial offset.
export function toIntervals(s: positionVector): intervalVector {
  let out: number[] = [];
  let n = s.data.length;

  for (let i = 0; i < n; i++) {
    let interval = s.element(i + 1) - s.element(i);
    out.push(interval);
  }

  return new intervalVector(out, s.modulo, s.data[0]);
}

// Constructs a PositionVector by selecting elements from an existing PositionVector (s) based on cumulative intervals provided by an IntervalVector (j). 
// The selection starts from the offset in j, with subsequent positions determined by iteratively adding intervals from j to this sum. 
// The resulting vector is adjusted to cover its range via spanUpdate.
export function selectFromInterval(s: positionVector, j: intervalVector) {
  let v: number[] = [];
  let sum = j.offset;

  for (let i = 0; i < j.data.length; i++) {
    v.push(s.element(sum));
    sum += j.data[i];
  }

  let out = new positionVector(v, s.modulo, s.span);
  out.spanUpdate();

  return out;
}
