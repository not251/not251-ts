import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { toPositions } from "./crossOperation";

// scale Generates a positionVector based on an input intervalVector, allowing for transformations like inversion and mirroring. 
// It rotates the interval vector by modo, adjusts the root, and optionally inverts or mirrors it. 
// The output is then converted to a position vector, which is roto-translated by grado to finalize its configuration.

// Parameters:
// intervalli: The base intervals that define the scale.
// root: Starting pitch or offset for the scale.
// modo: Rotation step to define the starting position of the scale.
// grado: Degree of roto-translation applied to the final scale.
// isInvert: If true, the scale is inverted.
// isMirror: If true, a mirroring operation is applied.
// mirrorPos: Position at which the mirroring occurs.
// mirrorLeft: Determines the mirroring direction (left or right).

export default function scale(
  intervalli: intervalVector,
  root: number = 0,
  modo: number = 0,
  grado: number = 0,
  isInvert: boolean = false,
  isMirror: boolean = false,
  mirrorPos: number = 0,
  mirrorLeft: boolean = false
): positionVector {
  intervalli.offset = root;
  let out: intervalVector = intervalli.rotate(modo);
  if (isInvert) out = out.invert();
  if (isMirror) out = out.singleMirror(mirrorPos, mirrorLeft);
  let outPos: positionVector = toPositions(out);
  outPos.spanUpdate();
  outPos.rototranslate(grado);
  return outPos;
}
