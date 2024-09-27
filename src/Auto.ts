import * as PV from "./PositionVector";
import * as IV from "./IntervalVector";
import * as Distances from "./Distances";
import * as CO from "./CrossOperation";

export function autoVoicing(
  reference: PV.PositionVector,
  target: PV.PositionVector
): { pv: PV.PositionVector; inversion: number } {
  reference.spanUpdate();
  target.spanUpdate();

  let center = Distances.minRotation(reference, target);

  let options = target.options(center);

  let matrix: Distances.OptionMatrix = [];
  for (let i = 0; i < options.length; ++i) {
    matrix.push({
      rotation: center - target.data.length + i,
      data: options[i].data,
    });
  }

  let distances = Distances.euclideanDistanceMap(matrix, reference.data);
  let sortedDistances = Distances.sortByDistance(distances);

  let r = sortedDistances[0].rotation;
  let firstElement = sortedDistances[0].data;

  let pv = new PV.PositionVector(firstElement, target.modulo, target.span);

  return { pv: pv, inversion: r };
}

export type ModeMapElement = {
  rotation: number;
  data: PV.PositionVector;
};

export type ModeMap = ModeMapElement[];

export function autoModeGO(scale: IV.IntervalVector): ModeMap {
  let out: ModeMap = [];
  let max = scale.data.length;

  for (let r = 0; r < max; r++) {
    let option: ModeMapElement = {
      rotation: 0,
      data: new PV.PositionVector([], 1, 1),
    };
    let rotated = scale.rotate(r, max, false);
    option.data = CO.toPositions(rotated);
    option.rotation = r;
    out.push(option);
  }

  return out;
}

export function autoModeOptions(
  modes: ModeMap,
  notes: PV.PositionVector
): {
  rotation: number;
  data: number[];
}[] {
  let out: {
    rotation: number;
    data: number[];
  }[] = [];

  for (let mode in modes) {
    let allNotesFound = true;
    let modePositions = modes[mode].data.data;

    for (let i = 0; i < notes.data.length; i++) {
      let note = notes.data[i];
      let found = false;

      for (let j = 0; j < modePositions.length; j++) {
        if (note % notes.modulo === modePositions[j]) {
          found = true;
          break;
        }
      }

      if (!found) {
        allNotesFound = false;
        break;
      }
    }

    if (allNotesFound) {
      out[mode] = { data: modePositions, rotation: modes[mode].rotation };
    }
  }

  return out;
}

export function autoMode(
  scaleIntervals: IV.IntervalVector,
  notes: PV.PositionVector
): { rotation: number; data: PV.PositionVector } {
  let mod = scaleIntervals.modulo;
  let root = scaleIntervals.offset;

  for (let i = 0; i < notes.data.length; i++) {
    notes.data[i] -= root;
  }

  let modes = autoModeGO(scaleIntervals);
  let options = autoModeOptions(modes, notes);

  if (Object.keys(options).length === 0) {
    let scala = CO.toPositions(scaleIntervals);
    //THROW ERROR
    return { data: scala, rotation: -666 };
  }

  let scalePositions = CO.toPositions(scaleIntervals);

  let distanceMap = Distances.euclideanDistanceMap(
    options,
    scalePositions.data
  );

  let sortedDistances = Distances.sortByDistance(distanceMap);

  let r = sortedDistances[0].rotation;
  let bestOption = sortedDistances[0].data;

  let p = new PV.PositionVector(
    bestOption,
    scalePositions.modulo,
    scalePositions.span
  );
  let autoModeIntervals = CO.toIntervals(p);

  autoModeIntervals.offset = root;

  let mode = CO.toPositions(autoModeIntervals);

  return {
    data: mode,
    rotation: r,
  };
}
