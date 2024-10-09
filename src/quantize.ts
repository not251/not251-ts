import positionVector from "./positionVector";

/**
 * Quantizes a given note to the nearest value in the specified scale.
 * Returns the lower or upper neighbor based on the 'left' parameter.
 *
 * @param note - The note to be quantized.
 * @param scale - An array representing the scale.
 * @param left - If true, returns the lower neighbor; otherwise, the upper neighbor.
 * @returns The quantized note.
 */
export function quantize(note: number, scale: number[], left: boolean = true) {
  let lower = -1;
  let upper = -1;
  for (let i = 0; i < scale.length; i++) {
    if (scale[i] <= note) {
      lower = scale[i];
    }
    if (scale[i] >= note) {
      upper = scale[i];
      break;
    }
  }
  if (lower === -1) return upper;
  if (upper === -1) return lower;

  return left ? lower : upper;
}

/**
 * Quantize notes on an input scale and transpose them to an output scale, taking into account 
 * the specified roots for each scale.
 * Returns the corresponding degrees and transposed notes.
 *
 * @param inputscale - The input scale represented as a PositionVector.
 * @param outputscale - The output scale represented as a PositionVector.
 * @param inRoot - The root note of the input scale.
 * @param outRoot - The root note of the output scale.
 * @param notes - An array of notes to be transposed.
 * @returns An object containing the transposed degrees and notes.
 */
export function transpose(
  inputscale: positionVector,
  outputscale: positionVector,
  inRoot: number = 0,
  outRoot: number = 0,
  notes: number[]
): { degrees: number[]; notes: number[] } {
  let inscale = inputscale.data;
  let outscale = outputscale.data;
  let mod = inputscale.modulo;

  let outNotes: number[] = [];
  let outDegrees: number[] = [];
  let length = outscale.length;

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let inPC = (note - inRoot) % mod;
    if (inPC < 0) inPC += mod;
    let octave = Math.floor((note - inRoot) / mod);

    let left = true;
    let index = inscale.indexOf(inPC);
    if (index === -1) {
      inPC = quantize(inPC, inscale, left);
      index = inscale.indexOf(inPC);
    }

    if (index !== -1) {
      let grado = index;
      let outPC = outscale[grado % length];
      let outNote = outPC + outRoot + octave * mod;

      if (outNotes.length > 0 && outNotes[outNotes.length - 1] === outNote) {
        if (i > 0 && notes[i] !== notes[i - 1]) {
          left = !left;
          inPC = quantize((note - inRoot) % mod, inscale, left);
          index = inscale.indexOf(inPC);
          if (index !== -1) {
            grado = index;
            outPC = outscale[grado % length];
            outNote = outPC + outRoot + octave * mod;
          }
        }
      }

      outNotes.push(outNote);
      outDegrees.push(grado);
    }
  }

  return { degrees: outDegrees, notes: outNotes };
}
