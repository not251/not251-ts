import * as PV from "./PositionVector";
import * as IV from "./IntervalVector";
import * as CO from "./CrossOperation";

export function scale(
  intervalli: IV.IntervalVector,
  root: number = 0,
  modo: number = 0,
  grado: number = 0,
  isInvert: boolean = false,
  isMirror: boolean = false,
  mirrorPos: number = 0,
  mirrorLeft: boolean = false
): PV.PositionVector {
  intervalli.offset = root;
  let out: IV.IntervalVector = intervalli.rotate(modo);
  if (isInvert) out = out.invert();
  if (isMirror) out = out.singleMirror(mirrorPos, mirrorLeft);
  let outPos: PV.PositionVector = CO.toPositions(out);
  outPos.spanUpdate();
  outPos.rototranslate(grado);
  return outPos;
}
