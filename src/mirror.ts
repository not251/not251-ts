// ha senso usarle con gli intervalvectors per scale, per i positionvector ha senso se si tratta di altezze nel tempo

// lo specchio posizionato su position riflette sia a destra sia a sinistra
export function doubleMirror(input: number[], position: number): number[] {
  let out = [...input];
  let length = out.length;

  if (position < 0 || position > length) {
    return out;
  }

  for (let i = 0; i < Math.floor(position / 2); i++) {
    [out[i], out[position - 1 - i]] = [out[position - 1 - i], out[i]];
  }

  let end = position + Math.floor((length - position) / 2);
  for (let i = position; i < end; i++) {
    [out[i], out[length - 1 - (i - position)]] = [
      out[length - 1 - (i - position)],
      out[i],
    ];
  }

  return out;
}

// riflette solo dal lato indicato da "left"
export function singleMirror(
  input: number[],
  position: number,
  left: boolean
): number[] {
  let out = [...input];
  let length = out.length;

  if (position < 0 || position > length) {
    return out;
  }

  if (left) {
    for (let i = 0; i < Math.floor(position / 2); i++) {
      [out[i], out[position - 1 - i]] = [out[position - 1 - i], out[i]];
    }
  } else {
    let end = position + Math.floor((length - position) / 2);
    for (let i = position; i < end; i++) {
      [out[i], out[length - 1 - (i - position)]] = [
        out[length - 1 - (i - position)],
        out[i],
      ];
    }
  }

  return out;
}

// sceglie un numero di elementi pari a "pos" a partire dal lato indicato da "left" e li riflette dal lato opposto
export function mirror2(input: number[], pos: number, left: boolean): number[] {
  let out = [...input];
  let n = input.length;

  if (left) {
    for (let i = 0; i < pos && i < n; i++) {
      out[n - 1 - i] = input[i];
    }
  } else {
    for (let i = pos; i < n; i++) {
      out[i - pos] = input[n - 1 - (i - pos)];
    }
  }

  return out;
}
