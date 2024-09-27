export function modulo(a: number, b: number): number {
  if (b < 0) return -modulo(-a, -b);
  let out = ((a % b) + b) % b;
  if (out < 0) out += b;
  return out;
}

export function reduceVectors(v1: number[], v2: number[]): number[][] {
  let r1 = [v1[0], v1[v1.length - 1]];
  let r2 = [v2[0], v2[v2.length - 1]];
  return [r1, r2];
}

export function degreeDetect(note: number, scale: number[], mod: number) {
  let normalizedNote = (note + mod) % mod;
  let index = scale.indexOf(normalizedNote);
  return index !== -1 ? index : -1;
}

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
