import positionVector from "./positionVector";
import intervalVector from "./intervalVector";

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

export function toIntervals(s: positionVector): intervalVector {
  let out: number[] = [];
  let n = s.data.length;

  for (let i = 0; i < n; i++) {
    let interval = s.element(i + 1) - s.element(i);
    out.push(interval);
  }

  return new intervalVector(out, s.modulo, s.data[0]);
}

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
