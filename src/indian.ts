import { isAllZeros, isAllOnes, appendOnes, cut } from "./utility";

// e: punto in cui termina la frase
// c: ciclicità della frase, numero di volte in cui la frase oltrepassa e prima di terminare
// n: numero di beats della battuta
// s: punto in cui inizia la frase
// l: suddivisione del beat (ad es. 2 se binaria, 3 se ternaria)

// la funzione restituisce un intero indicante il numero totale di suddivisioni coperte dalla frase, secondo la formula N=(e+cn-s)l
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

export function tihaiGenerator(n: number, m: number): [number, number] {
  let l = n;
  while (l % m !== 0) {
    l++;
  }
  const d = l - n;
  const b = Math.floor(l / m) - d;
  return [b, d];
}

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
