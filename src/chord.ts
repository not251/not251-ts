import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { selectFromInterval } from "./crossOperation";

// chordFromPosition Generates a chord by selecting positions from a scale and applying transformations, including inversion and negation. 
// This function uses a positionVector scale and selection to produce a position vector chord.

// Parameters:
// scala: The scale represented as a positionVector.
// grado: Degree of rotation to change the starting note of the scale.
// selection: Determines which positions in the scale are included in the chord.
// preVoices and postVoices: Number of voices to consider before and after the selection.
// isInvert: If true, the chord is inverted.
// isNegative: If true, the chord undergoes a negation transformation.
// negativePos: Position for the negation operation.
// standardNegative: Defines the type of negation applied.
// root and octave: Adjust the root note and octave of the resulting chord.
export function chordFromPosition(
  scala: positionVector,
  grado: number = 0,
  selection: positionVector,
  preVoices: number = 3,
  position: number = 0,
  postVoices: number = 3,
  isInvert: boolean = false,
  isNegative: boolean = false,
  negativePos: number = 10,
  standardNegative: boolean = true,
  root: number = 0,
  octave: number = 4
): positionVector {
  let octaves = octave * scala.modulo;
  let shiftedRoot = root + octaves;
  let scalePositions: positionVector = scala.rototranslate(grado);
  selection.rototranslate(0, preVoices);
  let out: positionVector = scalePositions.selectFromPosition(selection);
  out.rototranslate(position, postVoices);
  out.spanUpdate();
  if (isInvert) out = out.invert();
  if (isNegative) out = out.negative(negativePos, standardNegative);
  for (let i = 0; i < out.data.length; i++) {
    out.data[i] += shiftedRoot;
  }
  return out;
}

// Similar to chordFromPosition, this function constructs a chord but uses intervals rather than positions for the selection process. 
// It applies rotation, inversion, and negative to the generated position vector based on the provided scale.

// Parameters:
// scala: The scale as a positionVector.
// grado: Degree of rotation to change the starting note.
// selection: Intervals that define which positions in the scale are selected.
// preVoices and postVoices: Number of voices considered before and after the selection.
// isInvert: If true, the chord is inverted.
// isNegative: If true, the chord undergoes a negative transformation.
// negativePos: Position for negative.
// standardNegative: Specifies the negative type.
// root and octave: Adjust the root and octave of the chord.
export function chordFromInterval(
  scala: positionVector,
  grado: number = 0,
  selection: intervalVector,
  preVoices: number = 3,
  position: number = 0,
  postVoices: number = 3,
  isInvert: boolean = false,
  isNegative: boolean = false,
  negativePos: number = 10,
  standardNegative: boolean = true,
  root: number = 0,
  octave: number = 4
): positionVector {
  let octaves = octave * scala.modulo;
  let shiftedRoot = root + octaves;
  selection.rotate(0, preVoices);
  selection.offset = grado;
  let out: positionVector = selectFromInterval(scala, selection);
  out.rototranslate(position, postVoices);
  out.spanUpdate();
  if (isInvert) out = out.invert();
  if (isNegative) out = out.negative(negativePos, standardNegative);
  for (let i = 0; i < out.data.length; i++) {
    out.data[i] += shiftedRoot;
  }
  return out;
}
