import { positionVector } from "./positionVector";

/**
 * Quantizes a given note to the nearest value in the specified scale.
 * Returns the lower or upper neighbor based on the 'left' parameter.
 * If the note is outside the scale range, returns the closest boundary note.
 * If the scale is empty, returns the original note.
 *
 * @param note - The note to be quantized.
 * @param scale - An array representing the scale (should contain numbers).
 * @param left - If true, returns the lower neighbor; otherwise, the upper neighbor.
 * @returns The quantized note, or the original note if the scale is empty.
 */
export function quantize(note: number, scale: number[], left: boolean = true): number {
  // Handle empty scale
  if (scale.length === 0) {
    return note;
  }

  let lower: number | undefined = undefined; // Use undefined to distinguish from valid scale notes like 0 or -1
  let upper: number | undefined = undefined;

  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < scale.length; i++) {
    const scaleNote = scale[i];
    // FIX: Check if scaleNote is a valid number (TS2532, TS2322)
    if (scaleNote != null) {
      // Corretto: Usa <= invece di &lt;=
      if (scaleNote <= note) {
        // FIX: Assign valid number (TS2322)
        lower = scaleNote;
      }
      // Corretto: Usa >= invece di &gt;=
      if (scaleNote >= note) {
        // FIX: Assign valid number (TS2322)
        upper = scaleNote;
        break; // Found the upper bound, no need to continue
      }
    }
  }

  // Handle cases where note is outside the scale range
  if (lower === undefined && upper !== undefined) return upper; // Note is below the scale
  if (upper === undefined && lower !== undefined) return lower; // Note is above the scale
  if (lower === undefined && upper === undefined) return note; // Should not happen if scale is not empty, but return original note as fallback

  // If both lower and upper are defined (note is within or on the boundaries)
  // FIX: Use non-null assertions as we've handled undefined cases
  return left ? lower! : upper!;
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
  // Filter undefined from scale data
  let inscale = inputscale.data.filter((v): v is number => v != null);
  let outscale = outputscale.data.filter((v): v is number => v != null);
  let mod = inputscale.modulo;

  let outNotes: number[] = [];
  let outDegrees: number[] = [];
  let length = outscale.length;

  // Handle empty scales after filtering
  if (inscale.length === 0 || outscale.length === 0 || length === 0) {
      return { degrees: [], notes: [] };
  }


  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < notes.length; i++) {
    // FIX: Check if notes[i] is defined (TS18048)
    let note = notes[i];
    if (note == null) continue; // Skip if note is null/undefined

    let inPC = (note - inRoot) % mod;
    // Corretto: Usa < invece di &lt;
    if (inPC < 0) inPC += mod;
    // FIX: Check if note is defined before division (TS18048)
    let octave = Math.floor((note - inRoot) / mod);

    let left = true;
    let index = inscale.indexOf(inPC);
    // Corretto: Usa === invece di ==
    if (index === -1) {
      inPC = quantize(inPC, inscale, left); // quantize now returns number
      index = inscale.indexOf(inPC);
    }

    // Corretto: Usa !== invece di !=
    if (index !== -1) {
      let grado = index;
      // FIX: Check if outscale[grado % length] is defined (TS18048)
      let outPC = outscale[grado % length];
      if (outPC == null) continue; // Skip if output pitch class is undefined

      let outNote = outPC + outRoot + octave * mod;

      // Corretto: Usa > invece di &gt; e === invece di ==
      if (outNotes.length > 0 && outNotes[outNotes.length - 1] === outNote) {
        // Corretto: Usa > invece di &gt; e !== invece di !=
        if (i > 0 && notes[i] !== notes[i - 1]) {
          left = !left;
          // FIX: Check if note is defined before modulo (TS18048)
          const noteMod = (note - inRoot) % mod; // Calculate once
          inPC = quantize(noteMod < 0 ? noteMod + mod : noteMod, inscale, left);
          index = inscale.indexOf(inPC);
          // Corretto: Usa !== invece di !=
          if (index !== -1) {
            grado = index;
            // FIX: Check if outscale[grado % length] is defined (TS18048)
            outPC = outscale[grado % length];
            if (outPC == null) continue; // Skip if output pitch class is undefined
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
