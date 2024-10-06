// ha senso usarle con gli intervalvectors per scale, per i positionvector ha senso se si tratta di altezze nel tempo

// Performs a two-part reflection on an array of numbers. 
// First, elements up to a specified position are mirrored inward. 
// Then, the reflection is applied again to elements after the position up to the end of the array, mirroring outward. 
// This creates a symmetrical pattern in the data around the central position.
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

// Reflects elements either to the left or right of a specified position. 
// If left is true, elements up to position are mirrored inwards; otherwise, elements from position to the end are reflected outwards. 
// The result is a mirrored IntervalVector, updating data if autoupdate is true.
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

// Mirrors elements in an array around a specified pos. 
// If left is true, the left section (up to pos) is mirrored to the right end, flipping the array symmetrically from the start. 
// If left is false, the right section (from pos onward) is mirrored towards the start, creating symmetry from the right side. 
// The function returns the mirrored array as out.
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
