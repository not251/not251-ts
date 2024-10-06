// Computes the positive modulo of two numbers a and b, handling negative values as well. 
// If b is negative, it first adjusts both a and b to be positive. 
// Then, it calculates the modulo, ensuring that the result is non-negative by adding b if necessary. 
// This operation is useful for wrapping values within a specified range.
export function modulo(a: number, b: number): number {
  if (b < 0) return -modulo(-a, -b);
  let out = ((a % b) + b) % b;
  if (out < 0) out += b;
  return out;
}

// Simplifies two input vectors, v1 and v2, by reducing each to an array containing only the first and last elements. 
// The function returns a tuple containing these reduced vectors. 
// This is particularly helpful when only the endpoints of the vectors are relevant for comparisons or further calculations.
export function reduceVectors(v1: number[], v2: number[]): number[][] {
  let r1 = [v1[0], v1[v1.length - 1]];
  let r2 = [v2[0], v2[v2.length - 1]];
  return [r1, r2];
}

// Determines the degree of a given note within a scale, using mod as the wrapping modulus. 
// The note is normalized within the scale range by calculating (note + mod) % mod. 
// If the normalized note is found in the scale, the function returns its index; otherwise, it returns -1, indicating the note is not in the scale.
export function degreeDetect(note: number, scale: number[], mod: number) {
  let normalizedNote = (note + mod) % mod;
  let index = scale.indexOf(normalizedNote);
  return index !== -1 ? index : -1;
}

// Analyzes a vector of notes to detect each note’s degree within a scale, using mod for normalization. 
// For each note, it calculates its position within the scale and appends the degree index to the degrees array, or -1 if the note is not found in the scale. 
// This allows you to map all notes in a vector to their respective scale degrees at once.
export function degreeDetectVec(notes: number[], scale: number[], mod: number) {
  // Inizializza un array per memorizzare i gradi rilevati
  let degrees: number[] = [];

  // Itera su ogni nota nel vettore
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let normalizedNote = (note + mod) % mod;
    let index = scale.indexOf(normalizedNote);

    // Aggiungi il grado rilevato all'array o -1 se non trovato
    degrees.push(index !== -1 ? index : -1);
  }

  return degrees;
}

// Generates a mapping of all rotations of a given input array within a modulus, mod. 
// For each possible rotation from 0 to mod-1, it shifts each element of the input array by the rotation index and stores the sorted result in an object. 
// This map allows quick reference to any transposed version of the original array, which is sorted for easier comparisons.
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

// Filters a dictionary of pitch classes (input) to find which rotations contain all the specified notes within a modulus mod. 
// For each rotation, the function checks if every note, reduced by the modulus, exists in the corresponding pitch class. 
// It returns a new dictionary containing only the rotations that include all specified notes.
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

export function isAllZeros(arr: number[]): boolean {
  return arr.every((i) => i === 0);
}

export function isAllOnes(arr: number[]): boolean {
  return arr.every((i) => i === 1);
}

export function cut(arr: number[], n: number): number[] {
  return arr.slice(0, Math.min(n, arr.length));
}

export function appendOnes(arr: number[], n: number): void {
  while (arr.length < n) {
    arr.push(1);
  }
}
