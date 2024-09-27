import * as PV from "./PositionVector";

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

export function transpose(
  inputScale: PV.PositionVector,
  outputScale: PV.PositionVector,
  inRoot: number,
  outRoot: number,
  notes: number[]
): { degrees: number[]; notes: number[] } {
  let inScale = inputScale.data;
  let outScale = outputScale.data;
  let mod = inputScale.modulo;

  let outNotes: number[] = [];
  let outDegrees: number[] = [];
  let inScaleSize = inScale.length;
  let length = outScale.length;

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let inPC = (note - inRoot) % mod;
    if (inPC < 0) inPC += mod;
    let octave = Math.floor((note - inRoot) / mod);

    let left = true;
    let index = inScale.indexOf(inPC);
    if (index === -1) {
      inPC = quantize(inPC, inScale, left);
      index = inScale.indexOf(inPC);
    }

    if (index !== -1) {
      let grado = index;
      let outPC = outScale[grado % length];
      let outNote = outPC + outRoot + octave * mod;

      if (outNotes.length > 0 && outNotes[outNotes.length - 1] === outNote) {
        if (i > 0 && notes[i] !== notes[i - 1]) {
          left = !left;
          inPC = quantize((note - inRoot) % mod, inScale, left);
          index = inScale.indexOf(inPC);
          if (index !== -1) {
            grado = index;
            outPC = outScale[grado % length];
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
