import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import {
  euclideanDistanceMap,
  minRotation,
  sortByDistance,
  optionMatrix,
} from "./distances";
import { toIntervals, toPositions } from "./crossOperation";

export function autoVoicing(
  reference: positionVector,
  target: positionVector
): { pv: positionVector; inversion: number } {
  reference.spanUpdate();
  target.spanUpdate();

  let center = minRotation(reference, target);

  let options = target.options(center);

  let matrix: optionMatrix = [];
  for (let i = 0; i < options.length; ++i) {
    matrix.push({
      rotation: center - target.data.length + i,
      data: options[i].data,
    });
  }

  let distances_map = euclideanDistanceMap(matrix, reference.data);
  let sorteddistances = sortByDistance(distances_map);

  let r = sorteddistances[0].rotation;
  let firstElement = sorteddistances[0].data;

  let pv = new positionVector(firstElement, target.modulo, target.span);

  return { pv: pv, inversion: r };
}

export type modeMapElement = {
  rotation: number;
  data: positionVector;
};

export type modeMap = modeMapElement[];

export function autoModeGO(scale: intervalVector): modeMap {
  let out: modeMap = [];
  let max = scale.data.length;

  for (let r = 0; r < max; r++) {
    let option: modeMapElement = {
      rotation: 0,
      data: new positionVector([], 1, 1),
    };
    let rotated = scale.rotate(r, max, false);
    option.data = toPositions(rotated);
    option.rotation = r;
    out.push(option);
  }

  return out;
}

export function autoModeOptions(
  modes: modeMap,
  notes: positionVector
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
  scaleIntervals: intervalVector,
  notes: positionVector
): { rotation: number; data: positionVector } {
  let mod = scaleIntervals.modulo;
  let root = scaleIntervals.offset;

  for (let i = 0; i < notes.data.length; i++) {
    notes.data[i] -= root;
  }

  let modes = autoModeGO(scaleIntervals);
  let options = autoModeOptions(modes, notes);

  if (Object.keys(options).length === 0) {
    let scala = toPositions(scaleIntervals);
    //THROW ERROR
    return { data: scala, rotation: -666 };
  }

  let scalePositions = toPositions(scaleIntervals);

  let distanceMap = euclideanDistanceMap(options, scalePositions.data);

  let sorteddistances = sortByDistance(distanceMap);

  let r = sorteddistances[0].rotation;
  let bestOption = sorteddistances[0].data;

  let p = new positionVector(
    bestOption,
    scalePositions.modulo,
    scalePositions.span
  );
  let autoModeIntervals = toIntervals(p);

  autoModeIntervals.offset = root;

  let mode = toPositions(autoModeIntervals);

  return {
    data: mode,
    rotation: r,
  };
}
