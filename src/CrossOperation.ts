import * as PV from "./PositionVector";
import * as IV from "./IntervalVector";

export function toPositions(s: IV.IntervalVector): PV.PositionVector {
  let n = s.data.length;
  let out = new Array(n);
  let sum = s.offset;
  for (let i = 0; i < n; i++) {
    out[i] = sum;
    sum += s.data[i];
  }
  sum -= s.offset;
  return new PV.PositionVector(out, s.modulo, sum);
}

export function toIntervals(s: PV.PositionVector): IV.IntervalVector {
  let out: number[] = [];
  let n = s.data.length;

  for (let i = 0; i < n; i++) {
    let interval = s.element(i + 1) - s.element(i);
    out.push(interval);
  }

  return new IV.IntervalVector(out, s.modulo, s.data[0]);
}

export function selectFromInterval(s: PV.PositionVector, j: IV.IntervalVector) {
  let v: number[] = [];
  let sum = j.offset;

  for (let i = 0; i < j.data.length; i++) {
    v.push(s.element(sum));
    sum += j.data[i];
  }

  let out = new PV.PositionVector(v, s.modulo, s.span);
  out.spanUpdate();

  return out;
}
