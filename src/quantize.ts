import positionVector from "./positionVector";

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
