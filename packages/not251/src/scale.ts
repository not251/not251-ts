import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { toIntervals, toPositions } from "./crossOperation";
import { euclideanDistanceMap, minRotation, sortByDistance } from "./distances";

export type ScaleParams = {
  intervals?: intervalVector;
  root?: number;
  modo?: number;
  grado?: number;
  isInvert?: boolean;
  isMirror?: boolean;
  mirrorPos?: number;
  mirrorLeft?: boolean;
};

export const defaultScaleParams: ScaleParams = {
  intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
  root: 0,
  modo: 0,
  grado: 0,
  isInvert: false,
  isMirror: false,
  mirrorPos: 0,
  mirrorLeft: false,
} as const;

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
export function scale({
  intervals = new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 12),
  root = 0,
  modo = 0,
  grado = 0,
  isInvert = false,
  isMirror = false,
  mirrorPos = 0,
  mirrorLeft = false,
}: ScaleParams = defaultScaleParams): positionVector {
  intervals.offset = root;
  let out: intervalVector = intervals.rotate(modo);
  if (isInvert) out = out.invert();
  if (isMirror) out = out.singleMirror(mirrorPos, mirrorLeft);
  let outPos: positionVector = toPositions(out);
  outPos.spanUpdate();
  outPos.rototranslate(grado);
  return outPos;
}

/**
 * Defines the structure for a single mode entry, including the rotation index and a position vector.
 * This structure facilitates storing multiple modal variations of a scale, each represented by its own rotation.
 */
type modeMapElement = {
  rotation: number;
  data: positionVector;
};

/**
 * An array of modeMapElement objects, serving as a collection for multiple modes of a scale.
 * Allows for easy iteration and mode selection based on rotation.
 */
type modeMap = modeMapElement[];

/**
 * Returns a map of modeMap elements with rotation indexes and position vectors.
 * Generates all possible modes for a given interval vector scale by rotating it.
 *
 * @param scale The intervalVector containing the scale to be analyzed.
 * @returns A modeMap containing the generated modes with their respective rotations.
 */
function autoModeGO(scale: intervalVector): modeMap {
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

/**
 * Checks each mode in the mode map and returns matching rotation and data as an array of objects.
 * Determines all compatible modes that contain all the given notes from a position vector.
 *
 * @param modes The modeMap containing the modes to be analyzed.
 * @param notes The positionVector containing the notes to be analyzed.
 * @returns An array of objects, each containing a rotation and the corresponding mode data.
 */
function autoModeOptions(
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

/**
 * !!! simplify!!!
 *
 * Returns the best match as an object with rotation and position vector data.
 * Automatically finds the best fitting mode for a given set of notes and interval vector scale.
 *
 * @param scaleIntervals The intervalVector containing the scale intervals to be analyzed.
 * @param notes The positionVector containing the notes to be targeted.
 * @returns An object containing the rotation and the best fitting position vector data.
 */
function autoMode_internal(
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

/**
 *
 * @param inputScaleParams input scale parameters
 * @param notes notes to find right mode for
 * @returns new scale parameters
 */
export function autoMode(
  inputScaleParams: ScaleParams,
  notes: positionVector
): ScaleParams {
  let result = autoMode_internal(
    inputScaleParams.intervals as intervalVector,
    notes
  );
  let outputScaleParams = inputScaleParams;
  outputScaleParams.modo = result.rotation;
  return outputScaleParams;
}
