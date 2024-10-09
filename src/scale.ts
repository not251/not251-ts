import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { toPositions } from "./crossOperation";

/**
 * Generates a positionVector based on an input intervalVector, allowing for transformations like inversion and mirroring. 
 * It rotates the interval vector by modo, adjusts the root, and optionally inverts or mirrors it. 
 * The output is then converted to a position vector, which is roto-translated by grado to finalize its configuration.
 * 
 * @param intervalli - The base intervals that define the scale.
 * @param root - Starting pitch or offset for the scale (default is 0).
 * @param modo - Rotation step to define the starting position of the scale (default is 0).
 * @param grado - Degree of roto-translation applied to the final scale (default is 0).
 * @param isInvert - If true, the scale is inverted (default is false).
 * @param isMirror - If true, a mirroring operation is applied (default is false).
 * @param mirrorPos - Position at which the mirroring occurs (default is 0).
 * @param mirrorLeft - Determines the mirroring direction (left or right) (default is false).
 * @returns The resulting positionVector after applying the transformations.
 */

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
