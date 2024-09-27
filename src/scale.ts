import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { toPositions } from "./crossOperation";

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
