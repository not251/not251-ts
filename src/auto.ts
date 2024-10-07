import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import {
  euclideanDistanceMap,
  minRotation,
  sortByDistance,
  optionMatrix,
  editDistance,
  distanceMap,
} from "./distances";
import { toIntervals, toPositions, selectFromInterval } from "./crossOperation";
import { findPC, scaleMap } from "./utility";

/**
 * Adjusts the target position vector to match the reference vector by finding the optimal rotation.
 * Evaluates possible rotations and calculates the Euclidean distance to determine the best alignment.
 * Returns an object containing the modified position vector, the applied rotation (inversion), and the distance between the two vectors.
 *
 * @param reference The reference position vector to be matched.
 * @param target The target position vector to be adjusted.
 * @returns An object containing the adjusted position vector, the applied rotation, and the distance between the two vectors.
 */
export function autoVoicing(
  reference: positionVector,
  target: positionVector
): { pv: positionVector; inversion: number; distance: number } {
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
  let distance = sorteddistances[0].distance;

  let pv = new positionVector(firstElement, target.modulo, target.span);

  return { pv: pv, inversion: r, distance: distance };
}

/**
 * Defines the structure for a single mode entry, including the rotation index and a position vector.
 * This structure facilitates storing multiple modal variations of a scale, each represented by its own rotation.
 */
export type modeMapElement = {
  rotation: number;
  data: positionVector;
};

/**
 * An array of modeMapElement objects, serving as a collection for multiple modes of a scale.
 * Allows for easy iteration and mode selection based on rotation.
 */
export type modeMap = modeMapElement[];

/**
 * Returns a map of modeMap elements with rotation indexes and position vectors.
 * Generates all possible modes for a given interval vector scale by rotating it.
 *
 * @param scale  intervalVector containing the scale to be analyzed
 * @returns
 */
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

/**
 * Checks each mode in the mode map and returns matching rotation and data as an array of objects.
 * Determines all compatible modes that contain all the given notes from a position vector.
 *
 * @param modes modeMap containing the modes to be analyzed
 * @param notes positionVector containing the notes to be analyzed
 * @returns
 */
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

/**
 * Returns the best match as an object with rotation and position vector data.
 *  Automatically finds the best fitting mode for a given set of notes and interval vector scale.
 * @param scaleIntervals intervalVector containing the scale intervals to be analyzed
 * @param notes positionVector containing the notes to be target
 * @returns
 */
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

/**
 * Automatically determines the root position of a scale that best matches a set of notes.
 * Uses edit distance to find the closest match and returns the root position.
 *
 * @param scale positionVector containing the scale to be analyzed
 * @param notes array of numbers containing the notes to be targeted
 * @returns
 */
export function autoRoot(scale: positionVector, notes: number[]): number {
  let result = scaleMap(scale.data, scale.modulo);
  let foundMap = findPC(result, scale.modulo, notes);

  if (Object.keys(foundMap).length === 0) {
    return -666;
  }

  let minDistance = Number.MAX_VALUE;
  let root = -1;

  for (const key in foundMap) {
    let value = foundMap[key];
    let distance = editDistance(value, scale.data);
    if (distance < minDistance) {
      minDistance = distance;
      root = parseInt(key);
    }
  }

  return root;
}

/**
 * Automatically matches and adjusts voicing between two position vectors, based on closest pitches.
 * Returns a new position vector that represents the updated voicing.
 *
 * @param v1 positionVector containing the first position vector to be analyzed
 * @param v2 positionVector containing the second position vector to be analyzed
 * @returns
 */
export function autovoicingP2P(
  v1: positionVector,
  v2: positionVector
): positionVector {
  let out = v2.data.slice();
  let used = new Array(out.length).fill(false);
  let mod = v2.modulo;

  for (let i = 0; i < v1.data.length && i < out.length; ++i) {
    let target = v1.data[i];
    let closest_diff = Infinity;
    let closest_index = i;

    for (let j = i; j < out.length; ++j) {
      if (!used[j]) {
        let diff = Math.abs(((target % mod) - (out[j] % mod) + mod) % mod);
        let abs_diff = Math.abs(target - out[j]);

        if (
          diff < closest_diff ||
          (diff === closest_diff &&
            abs_diff < Math.abs(target - out[closest_index]))
        ) {
          closest_diff = diff;
          closest_index = j;
        }
      }
    }

    [out[i], out[closest_index]] = [out[closest_index], out[i]];
    used[i] = true;

    let octave_diff = target - out[i];
    out[i] += Math.floor(octave_diff / mod) * mod;

    if (Math.abs(target - (out[i] + mod)) < Math.abs(target - out[i])) {
      out[i] += mod;
    } else if (Math.abs(target - (out[i] - mod)) < Math.abs(target - out[i])) {
      out[i] -= mod;
    }
  }

  out.sort((a, b) => a - b);
  let outPV = new positionVector(out, v1.modulo, v1.span);
  outPV.spanUpdate();
  return outPV;
}

/**
 * Represents an element in the auto grado map, which stores different voicing results for a given scale.
 * Includes scale, result position vector, grado (degree), and distance.
 */
export type autoGradoMapElement = {
  scale: positionVector;
  result: positionVector;
  grado: number;
  distance: number;
};

/**
 * An array of autoGradoMapElement objects, providing a collection of voicing results across scales and degrees.
 * Useful for finding the best voicing match for a given target.
 */
export type autoGradoMap = autoGradoMapElement[];

/**
 * Generates a map of voicing options for a scale, considering different degrees and target positions.
 * Returns an array of autoGradoMap elements, each with voicing results and distance information.
 *
 * @param scalaMap map of scales
 * @param grado degree
 * @param voicing interval vector
 * @param target target
 * @returns
 */
export function autoGradoGO(
  scalaMap: positionVector[],
  grado: number,
  voicing: intervalVector,
  target: positionVector
): autoGradoMap {
  let voicingMap: autoGradoMap = [];

  for (let j = 0; j < scalaMap.length; ++j) {
    voicing.offset = grado;
    for (let i = 0; i < voicing.data.length; ++i) {
      let v = selectFromInterval(scalaMap[j], voicing);
      let autovoiced = autoVoicing(target, v);

      voicingMap.push({
        scale: scalaMap[j],
        result: autovoiced.pv,
        grado: voicing.offset,
        distance: autovoiced.distance,
      });

      voicing.offset -= voicing.data[i];
    }
  }

  return voicingMap;
}

/**
 * Finds the best voicing match for a given grado in a scale map.
 * Sorts by distance and returns the closest match as an autoGradoMapElement object.
 * @param scalaMap map of scales
 * @param grado degree
 * @param voicing interval vector
 * @param target target
 * @returns autoGradoMapElement
 */
export function autoGrado(
  scalaMap: positionVector[],
  grado: number,
  voicing: intervalVector,
  target: positionVector
): autoGradoMapElement {
  let map = autoGradoGO(scalaMap, grado, voicing, target);

  map = map.sort((a, b) => a.distance - b.distance);

  return map[0];
}

/**
 * Class for managing and updating two consecutive position vectors, used in auto voicing.
 * Allows for comparison between current and previous states of position vectors.
 */
class autoVoicingCouple {
  private a: positionVector;
  private b: positionVector;

  constructor() {
    this.a = new positionVector([], 1, 1);
    this.b = new positionVector([], 1, 1);
  }

  /**
   * @param input position vector
   * @returns void
   */
  update(input: positionVector): void {
    this.a = this.b;
    this.b = new positionVector([...input.data], input.modulo, input.span);
  }

  get(): { first: positionVector; second: positionVector } {
    return {
      first: this.a,
      second: this.b,
    };
  }
}

/**
 * Updates the auto voicing process with a new position vector and optional auto flag.
 * Returns the updated position vector, inversion position, and distance, or the previous vector if auto is off.
 * @param input position vector
 * @param isAuto boolean
 * @returns
 */
function autoVoicingUpdate(
  input: positionVector,
  isAuto: boolean
): [positionVector, number, number] {
  let coppia = new autoVoicingCouple();
  coppia.update(input);
  let vectors = coppia.get();
  let v1: positionVector = vectors.first;
  let v2: positionVector = vectors.second;

  if (v1.data.length === 0) {
    v1 = v2;
  }

  let autoVoicingInfo: {
    pv: positionVector;
    inversion: number;
    distance: number;
  } = autoVoicing(v1, v2);
  let voiced: positionVector = autoVoicingInfo.pv;
  let position: number = autoVoicingInfo.inversion;
  let distance: number = autoVoicingInfo.distance;

  if (isAuto) {
    coppia.update(voiced);
    return [voiced, position, distance];
  } else {
    return [v2, 0, 0];
  }
}
