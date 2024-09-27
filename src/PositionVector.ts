import * as utility from "./Utility";

//absolute
export class PositionVector {
  data: number[];
  modulo: number;
  span: number;

  constructor(data: number[], modulo: number, span: number) {
    this.data = data;
    this.modulo = modulo;
    this.span = span;
  }

  element(i: number): number {
    let n = this.data.length;
    let out = 0;
    if (i >= 0) {
      out = this.data[utility.modulo(i, n)] + Math.abs(this.span) * ~~(i / n);
    } else {
      out =
        this.data[utility.modulo(i, n)] +
        Math.abs(this.span) * (~~((i + 1) / n) - 1);
    }
    return out;
  }

  rototranslate(
    start: number,
    n: number = this.data.length,
    autoupdate: boolean = true
  ): PositionVector {
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.element(start + i);
    }
    if (autoupdate) this.data = out;

    return new PositionVector(out, this.modulo, this.span);
  }

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

  invert(autoupdate: boolean = true): PositionVector {
    let out = this.data.slice();
    for (let i = 0; i < out.length; i++) {
      out[i] *= -1;
    }
    if (autoupdate) this.data = out;
    return new PositionVector(out, this.modulo, this.span);
  }

  negative(
    position: number = 10,
    standard: boolean = true,
    autoupdate: boolean = true
  ): PositionVector {
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

    let outV: PositionVector = new PositionVector(out, this.modulo, this.span);

    outV.rototranslate(-1);

    if (autoupdate) this.data = out;
    return outV;
  }

  options(center: number): PositionVector[] {
    let map: PositionVector[] = [];
    let n = this.data.length;

    for (let i = center - n; i < center + n; i++) {
      const option = this.rototranslate(i, n, false);
      map.push(option);
    }
    return map;
  }

  selectFromPosition(p: PositionVector) {
    let v = [];
    for (let i = 0; i < p.data.length; i++) {
      v.push(this.element(p.data[i]));
    }
    let out = new PositionVector(v, this.modulo, this.span);
    out.spanUpdate();
    return out;
  }
}
