import { modulo } from "./utility";

//relative
export default class intervalVector {
  data: number[];
  modulo: number;
  offset: number;

  constructor(data: number[], modulo: number, offset: number) {
    this.data = data;
    this.modulo = modulo;
    this.offset = offset;
  }

  element(i: number): number {
    return this.data[modulo(i, this.data.length)];
  }

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

  invert(autoupdate: boolean = true): intervalVector {
    let n = this.data.length;
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.data[n - 1 - i];
    }
    if (autoupdate) this.data = out;
    return new intervalVector(out, this.modulo, this.offset);
  }

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
