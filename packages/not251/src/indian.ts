import { isAllZeros, isAllOnes, appendOnes, cut } from "./utility";

/**
 * Calculates the total number of subdivisions covered by a musical phrase.
 * 
 * @param e - The point where the phrase ends.
 * @param c - The cyclicity of the phrase, indicating how many times it passes before ending.
 * @param n - The number of beats in the measure.
 * @param s - The point where the phrase begins.
 * @param l - The subdivision of the beat (e.g., 2 for binary, 3 for ternary).
 * @returns The total number of subdivisions covered by the phrase, calculated using the formula N = (e + cn - s) * l.
 */
export function phraseLength(
  e: number,
  c: number,
  n: number,
  s: number,
  l: number
): number {
  let length = (e + c * n - s) * l;
  return length;
}

/**
 * Generates a Tihai pattern based on the number of beats and the specified cycle length.
 * 
 * @param n - The total number of beats in the phrase.
 * @param m - The cycle length for the Tihai.
 * @returns A tuple containing the number of beats before the final beat (b) and the number of divisions (d).
 */
export function tihaiGenerator(n: number, m: number): [number, number] {
  let l = n;
  while (l % m !== 0) {
    l++;
  }
  const d = l - n;
  const b = Math.floor(l / m) - d;
  return [b, d];
}

/**
 * Constructs the Tihai pattern based on the number of beats before the final beat and divisions.
 * 
 * @param b - The number of beats before the final beat.
 * @param d - The number of divisions after the beats.
 * @param m - The cycle length for the Tihai.
 * @returns An array representing the Tihai pattern, where 1 indicates a beat and 0 indicates a division.
 */
export function tihaiReader(b: number, d: number, m: number): number[] {
  const out: number[] = [];

  for (let i = 0; i < b; i++) out.push(1);
  for (let i = 0; i < d; i++) out.push(0);

  for (let i = 0; i < m - 2; i++) {
    for (let j = 0; j < b; j++) out.push(1);
    for (let j = 0; j < d; j++) out.push(0);
  }

  for (let i = 0; i < b; i++) out.push(1);

  return out;
}

/**
 * Generates a Tihai pattern based on the total number of beats, cycle length, and a boolean flag.
 * 
 * @param n - The total number of beats in the phrase.
 * @param m - The cycle length for the Tihai.
 * @param a - A boolean flag to recursively call the tihai function when the results are all ones or all zeros, obtaining pseudo-tihais.
 * @returns An array representing the Tihai pattern.
 */
export function tihai(n: number, m: number, a: boolean): number[] {
  if (n <= 2) {
    return new Array(n).fill(1);
  }

  if (m === 1) {
    return new Array(n).fill(1);
  } else if (m <= 0) {
    return new Array(n).fill(0);
  } else {
    let [b, d] = tihaiGenerator(n, m);
    let pattern = tihaiReader(b, d, m);

    if (((isAllZeros(pattern) && a) || isAllOnes(pattern)) && a) {
      let shorterPattern = tihai(n - 1, m, a);
      appendOnes(shorterPattern, n);
      return shorterPattern;
    } else {
      return cut(pattern, n);
    }
  }
}
