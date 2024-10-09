// ha senso usarle con gli intervalvectors per scale, per i positionvector ha senso se si tratta di altezze nel tempo

/**
 * Performs a two-part reflection on an array around a central position.
 * First, elements up to a specified position are mirrored inwards.
 * Then, elements after the position are mirrored outward, creating a symmetrical pattern.
 * This function creates symmetry around the specified position in two directions.
 * @param input The array to reflect.
 * @param position The position around which the reflections occur.
 * @returns A new array with elements symmetrically mirrored around the central position.
 */
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

/**
 * Reflects elements either to the left or right of a specified position.
 * If 'left' is true, elements up to the position are mirrored inwards.
 * If 'left' is false, elements from the position to the end are mirrored outward.
 * This function creates a mirrored pattern around a position in one direction.
 * @param input The array to reflect.
 * @param position The position around which the reflection occurs.
 * @param left If true, mirrors elements to the left of the position; if false, to the right.
 * @returns A new array with elements mirrored according to the specified direction.
 */
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

/**
 * Mirrors elements in an array around a specified position in their opposite side:
 * If 'left' is true, mirrors elements from the left section (up to pos) to the right end, creating left-to-right reflection.
 * If 'left' is false, mirrors elements from the right section (from pos onward) back towards the start, creating right-to-left reflection.
 * This function effectively reflects the array elements to either side of the position.
 * @param input The array to reflect.
 * @param pos The central position around which the mirroring occurs.
 * @param left If true, mirrors left side elements to the right; if false, mirrors right side elements to the left.
 * @returns A new array with elements mirrored from either side of the position.
 */
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
