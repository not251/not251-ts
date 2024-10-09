/**
 * Computes the positive modulo of two numbers a and b, handling negative values as well. 
 * If b is negative, it first adjusts both a and b to be positive. 
 * Then, it calculates the modulo, ensuring that the result is non-negative by adding b if necessary. 
 * This operation is useful for wrapping values within a specified range.
 * 
 * @param a - The dividend.
 * @param b - The divisor.
 * @returns The positive modulo of a and b.
 */
export function modulo(a: number, b: number): number {
  if (b < 0) return -modulo(-a, -b);
  let out = ((a % b) + b) % b;
  if (out < 0) out += b;
  return out;
}

/**
 * Simplifies two input vectors, v1 and v2, by reducing each to an array containing only the first and last elements. 
 * The function returns a tuple containing these reduced vectors. 
 * This is particularly helpful when only the endpoints of the vectors are relevant for comparisons or further calculations.
 * 
 * @param v1 - The first input vector.
 * @param v2 - The second input vector.
 * @returns A tuple containing the first and last elements of both vectors.
 */
export function reduceVectors(v1: number[], v2: number[]): number[][] {
  let r1 = [v1[0], v1[v1.length - 1]];
  let r2 = [v2[0], v2[v2.length - 1]];
  return [r1, r2];
}

/**
 * Determines the degree of a given note within a scale, using mod as the wrapping modulus. 
 * The note is normalized within the scale range by calculating (note + mod) % mod. 
 * If the normalized note is found in the scale, the function returns its index; otherwise, it returns -1, indicating the note is not in the scale.
 * 
 * @param note - The note to be analyzed.
 * @param scale - The scale within which to determine the degree of the note.
 * @param mod - The modulus for normalization.
 * @returns The index of the note's degree within the scale, or -1 if not found.
 */
export function degreeDetect(note: number, scale: number[], mod: number) {
  let normalizedNote = (note + mod) % mod;
  let index = scale.indexOf(normalizedNote);
  return index !== -1 ? index : -1;
}

/**
 * Analyzes a vector of notes to detect each note’s degree within a scale, using mod for normalization. 
 * For each note, it calculates its position within the scale and appends the degree index to the degrees array, or -1 if the note is not found in the scale. 
 * This allows you to map all notes in a vector to their respective scale degrees at once.
 * 
 * @param notes - An array of notes to be analyzed.
 * @param scale - The scale within which to determine the degree of each note.
 * @param mod - The modulus for normalization.
 * @returns An array of indices representing the degrees of the notes in the scale, with -1 for notes not found.
 */
export function degreeDetectVec(notes: number[], scale: number[], mod: number) {
  let degrees: number[] = [];

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let normalizedNote = (note + mod) % mod;
    let index = scale.indexOf(normalizedNote);

    degrees.push(index !== -1 ? index : -1);
  }

  return degrees;
}

/**
 * Generates a mapping of all transpositions of a given input array within a modulus, mod. 
 * For each possible transpositions from 0 to mod-1, it shifts each element of the input array by the transposition index and stores the sorted result in an object. 
 * This map allows quick reference to any transposed version of the original array, which is sorted for easier comparisons.
 * 
 * @param input - The input array to be transposed.
 * @param mod - The modulus.
 * @returns An object mapping each transposition index to its sorted array.
 */
export function scaleMap(
  input: number[],
  mod: number
): { [key: number]: number[] } {
  let result: { [key: number]: number[] } = {};

  for (let i = 0; i < mod; ++i) {
    let temp: number[] = [];
    for (let j = 0; j < input.length; ++j) {
      temp.push((input[j] + i) % mod);
    }
    temp.sort((a, b) => a - b);
    result[i] = temp;
  }

  return result;
}

/**
 * Filters a dictionary of pitch classes (input) to find which row contain all the specified notes within a modulus mod. 
 * For each row, the function checks if every note, reduced by the modulus, exists in the corresponding pitch class. 
 * It returns a new dictionary containing only the rows that include all specified notes.
 * 
 * @param input - A dictionary mapping transposition indices to pitch class arrays.
 * @param mod - The modulus for normalizing the notes.
 * @param notes - An array of notes to check for inclusion in the pitch classes.
 * @returns A new dictionary containing only the rows that include all specified notes.
 */
export function findPC(
  input: { [key: number]: number[] },
  mod: number,
  notes: number[]
): { [key: number]: number[] } {
  let result: { [key: number]: number[] } = {};

  for (let key in input) {
    let value = input[key];
    let containsAllNotes = true;

    for (let i = 0; i < notes.length; ++i) {
      let note = notes[i];
      let pc = note % mod;
      if (value.indexOf(pc) === -1) {
        containsAllNotes = false;
        break;
      }
    }

    if (containsAllNotes) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Checks if all elements in the array are zeros. 
 * 
 * @param arr - The array to check.
 * @returns True if all elements are zero, otherwise false.
 */
export function isAllZeros(arr: number[]): boolean {
  return arr.every((i) => i === 0);
}

/**
 * Checks if all elements in the array are ones. 
 * 
 * @param arr - The array to check.
 * @returns True if all elements are one, otherwise false.
 */
export function isAllOnes(arr: number[]): boolean {
  return arr.every((i) => i === 1);
}

/**
 * Cuts the array to the specified length n, returning a new array. 
 * If n exceeds the array length, it returns the full array.
 * 
 * @param arr - The array to be cut.
 * @param n - The desired length of the resulting array.
 * @returns A new array containing the first n elements or the full array if n exceeds the length.
 */
export function cut(arr: number[], n: number): number[] {
  return arr.slice(0, Math.min(n, arr.length));
}

/**
 * Appends ones to the end of the array until it reaches the specified length n. 
 * If the array is already at or above the specified length, it makes no changes.
 * 
 * @param arr - The array to which ones will be appended.
 * @param n - The desired length of the array after appending.
 */
export function appendOnes(arr: number[], n: number): void {
  while (arr.length < n) {
    arr.push(1);
  }
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns The GCD of the two numbers.
 */
function gcd(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns The LCM of the two numbers.
 */
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/**
 * Calculates the LCM of two positionVector instances and scales their data, modulo and span accordingly.
 *
 * @param a - The first positionVector instance.
 * @param b - The second positionVector instance.
 * @returns A tuple containing two positionVector instances scaled to the same modulo.
 */
function lcmPosition(a: positionVector, b: positionVector): [positionVector, positionVector] {
  if (a.modulo === b.modulo) {
    return [a, b];
  }
  let c = lcm(a.modulo, b.modulo);
  let d = [];
  for (let i = 0; i < a.data.length; i++) {
    d.push((c / a.modulo) * a.data[i]);
  }
  let e = [];
  for (let i = 0; i < b.data.length; i++) {
    e.push((c / b.modulo) * b.data[i]);
  }
  return [
    new positionVector(d, c, (c / a.modulo) * a.span),
    new positionVector(e, c, (c / b.modulo) * b.span),
  ];
}

/**
 * Calculates the LCM of two intervalVector instances and scales their data, modulo and offset accordingly.
 *
 * @param a - The first intervalVector instance.
 * @param b - The second intervalVector instance.
 * @returns A tuple containing two intervalVector instances scaled to the same modulo.
 */
function lcmInterval(a: intervalVector, b: intervalVector): [intervalVector, intervalVector] {
  if (a.modulo === b.modulo) {
    return [a, b];
  }
  let c = lcm(a.modulo, b.modulo);
  let d = [];
  for (let i = 0; i < a.data.length; i++) {
    d.push((c / a.modulo) * a.data[i]);
  }
  let e = [];
  for (let i = 0; i < b.data.length; i++) {
    e.push((c / b.modulo) * b.data[i]);
  }
  return [
    new intervalVector(d, c, (c / a.modulo) * a.offset),
    new intervalVector(e, c, (c / b.modulo) * b.offset),
  ];
}
