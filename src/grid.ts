import intervalVector from "./intervalVector";

export function subdiv(n: number, group: intervalVector, p: number): number[] {
  let length = n;
  let g = 0;

  for (let i = 0; i < group.data.length; i++) {
    g += group.data[i];
  }

  if (n % g !== 0) {
    length -= n % g;
  }

  let out: number[] = [];
  for (let i = 0; i < length; i += g) {
    out.push(1);
    for (let j = 1; j < g; j++) {
      out.push(0);
    }
  }

  let irregular: number[] = [];
  if (out.length < n) {
    irregular.push(1);
    while (irregular.length < n - length) {
      irregular.push(0);
    }
  }

  let index = p * g;
  if (index > out.length) {
    index = out.length;
  }

  out.splice(index, 0, ...irregular);

  return out;
}

export function recursiveInsert(
  inArr: number[],
  group: intervalVector,
  num: number,
  left: boolean
): number[] {
  let out = [...inArr];
  let tot = 0;
  let g = 0;

  for (let i = 0; i < group.data.length; i++) {
    g += group.data[i];
  }

  group.modulo = g;
  let i = 0;

  while (tot < inArr.length) {
    if (tot % group.modulo !== 0) {
      out[tot] = num;
    }
    tot += group.element(i);
    i++;
  }

  return out;
}

export function insertAtMidpoint(
  inArr: number[],
  n: number,
  left: boolean
): number[] {
  let out = [...inArr];
  let l = inArr.length;

  if (l < 2) {
    return out;
  }

  let zeroGroup = false;
  let start = 0;

  for (let i = 1; i < l; i++) {
    if (inArr[i] === 0) {
      if (!zeroGroup) {
        zeroGroup = true;
        start = i;
      }
    } else {
      if (zeroGroup) {
        let groupSize = i - start;
        let midpoint = left
          ? start + Math.floor((groupSize - 1) / 2)
          : start + Math.floor(groupSize / 2);
        out[midpoint] = n;
        zeroGroup = false;
      }
    }
  }

  if (zeroGroup) {
    let last = l - 1;
    let groupSize = last - start + 1;
    let midpoint = left
      ? start + Math.floor((groupSize - 1) / 2)
      : last - Math.floor((groupSize - 1) / 2);
    out[midpoint] = n;
  }

  return out;
}

export function grid(
  n: number,
  group: intervalVector,
  left: boolean
): number[][] {
  let out: number[][] = [];

  let subdivisions = subdiv(n, group, n);
  out.push(subdivisions);

  let num = 2;

  if (group.data.length > 1) {
    let stage2 = recursiveInsert(subdivisions, group, num, true);
    out.push(stage2);
    num++;
  }

  while (true) {
    let stage = insertAtMidpoint(out[out.length - 1], num, left);
    out.push(stage);

    const zerosLeft = stage.some((val) => val === 0);
    if (!zerosLeft) {
      break;
    }

    num++;
  }

  return out;
}
