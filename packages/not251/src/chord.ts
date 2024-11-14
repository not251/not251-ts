import positionVector from "./positionVector";
import intervalVector from "./intervalVector";
import { selectFromInterval } from "./crossOperation";
import { scale } from "./scale";
import {
  euclideanDistanceMap,
  minRotation,
  optionMatrix,
  sortByDistance,
} from "./distances";
import { modulo } from "./utility";

export type ChordParams = {
  scala?: positionVector;
  selection?: positionVector | intervalVector;
  grado?: number;
  preVoices?: number;
  position?: number;
  postVoices?: number;
  root?: number;
  octave?: number;
  isInvert?: boolean;
  isNegative?: boolean;
  negativePos?: number;
  standardNegative?: boolean;
};

export const defaultChordParams: ChordParams = {
  scala: scale(),
  grado: 0,
  selection: new intervalVector([2], 12, 0),
  preVoices: 3,
  position: 0,
  postVoices: 3,
  isInvert: false,
  isNegative: false,
  negativePos: 10,
  standardNegative: true,
  root: 0,
  octave: 5,
} as const;

/**
 * Generates chords from intervals or positions depending on parameters.
 * @param param ChordParams
 * @returns
 */
export function chord({
  scala = scale(),
  grado = 0,
  selection = new intervalVector([2], 12, 0),
  preVoices = 3,
  position = 0,
  postVoices = 3,
  isInvert = false,
  isNegative = false,
  negativePos = 10,
  standardNegative = true,
  root = 0,
  octave = 5,
}: ChordParams = defaultChordParams) {
  if (selection instanceof positionVector) {
    return chordFromPosition(
      scala,
      grado,
      selection as positionVector,
      preVoices,
      position,
      postVoices,
      isInvert,
      isNegative,
      negativePos,
      standardNegative,
      root,
      octave
    );
  } else {
    return chordFromInterval(
      scala,
      grado,
      selection as intervalVector,
      preVoices,
      position,
      postVoices,
      isInvert,
      isNegative,
      negativePos,
      standardNegative,
      root,
      octave
    );
  }
}

/**
 * Generates a chord by selecting positions from a scale and applying transformations,
 * including inversion and negation. This function uses a positionVector scale and selection
 * to produce a position vector chord.
 *
 * @param scala - The scale represented as a positionVector.
 * @param grado - Degree of rotation to change the starting note of the scale (default is 0).
 * @param selection - Determines which positions in the scale are included in the chord.
 * @param preVoices - Number of voices to consider before the selection (default is 3).
 * @param position - Degree of roto-translation applied to the selected chord (default is 0).
 * @param postVoices - Number of voices to consider after the selection (default is 3).
 * @param isInvert - If true, the chord is inverted (default is false).
 * @param isNegative - If true, the chord undergoes a negative transformation (default is false).
 * @param negativePos - Position for the negative operation (default is 10).
 * @param standardNegative - Defines the type of negative applied (default is true).
 * @param root - Adjusts the root note of the resulting chord (default is 0).
 * @param octave - Adjusts the octave of the resulting chord (default is 4).
 * @returns The resulting positionVector chord after applying transformations.
 */
function chordFromPosition(
  scala: positionVector = scale(),
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

/**
 * Constructs a chord using intervals rather than positions for the selection process.
 * It applies rotation, inversion, and negation to the generated position vector based
 * on the provided scale.
 *
 * @param scala - The scale as a positionVector.
 * @param grado - Degree of rotation to change the starting note (default is 0).
 * @param selection - Intervals that define which positions in the scale are selected.
 * @param preVoices - Number of voices considered before the selection (default is 3).
 * @param position - Degree of roto-translation applied to the selected chord (default is 0).
 * @param postVoices - Number of voices considered after the selection (default is 3).
 * @param isInvert - If true, the chord is inverted (default is false).
 * @param isNegative - If true, the chord undergoes a negative transformation (default is false).
 * @param negativePos - Position for negative (default is 10).
 * @param standardNegative - Specifies the type of negative applied (default is true).
 * @param root - Adjusts the root note of the chord (default is 0).
 * @param octave - Adjusts the octave of the chord (default is 4).
 * @returns The resulting positionVector chord after applying transformations.
 */
function chordFromInterval(
  scala: positionVector = scale(),
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

export function autoVoicing(
  reference: ChordParams,
  target: ChordParams
): ChordParams {
  let output = { ...target };
  let result = autoVoicing_internal(
    chord({ ...reference }),
    chord({ ...target })
  );
  output.position = result.inversion;

  return output;
}

/**
 * Adjusts the target position vector to match the reference vector by finding the optimal rotation.
 * Evaluates possible rotations and calculates the Euclidean distance to determine the best alignment.
 * Returns an object containing the modified position vector, the applied rotation (inversion), and the distance between the two vectors.
 *
 * @param reference The reference position vector to be matched.
 * @param target The target position vector to be adjusted.
 * @returns An object containing the adjusted position vector, the applied rotation, and the distance between the two vectors.
 */
function autoVoicing_internal(
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
 * Automatically matches and adjusts voicing between two position vectors, based on closest pitches.
 * Returns a new position vector that represents the updated voicing.
 *
 * @param v1 The positionVector containing the first position vector to be analyzed.
 * @param v2 The positionVector containing the second position vector to be analyzed.
 * @returns A new position vector that represents the updated voicing.
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
 * Generates a block chord based on the given scale, degree, and chord degrees.
 * If `cluster` is true, generates cluster chords by adding notes according to specified criteria.
 *
 * @param scale - The scale as a **positionVector**.
 * @param degree - The degree of the scale to base the chord on.
 * @param chordDegrees - The degrees of the chord within the scale.
 * @param lastChord - The previous chord as a **positionVector** for comparison.
 * @param cluster - If `true`, generates cluster chords using the new feature (default is `false`).
 * @returns A **positionVector** representing the generated block chord.
 */

function generateBlockChord(
  scale: positionVector,
  degree: number,
  chordDegrees: positionVector,
  lastChord: positionVector,
  cluster: boolean = false
): positionVector {
  const voicing = new positionVector([degree], scale.data.length, scale.data.length);

  const reference = lastChord.rototranslate(3, lastChord.data.length, false);
  let index = -1;

  switch (modulo(degree, voicing.modulo)) {
    case 0:
      index = 0;
      break;
    case 1:
      if (chordDegrees.data[1] != 1) {
        index = 0;
      } else {
        index = 1;
      }
      break;
    case 2:
      index = 1;
      break;
    case 3:
      index = 1;
      break;
    case 4:
      index = 2;
      break;
    case 5:
      if (chordDegrees.data[3] != 6) {
        index = 2;
      } else {
        index = 3;
      }
      break;
    case 6:
      index = 3;
      break;
  }

  if (index == -1) {
    console.log("index broke");
  }
  index++;
  let octave = Math.floor(degree / voicing.modulo) * voicing.modulo;

  for (let i = 0; i < 3; i++) {
    let actualDegree = chordDegrees.element(index + i) + octave;
    let zeroDegree = modulo(actualDegree, chordDegrees.modulo);
    switch (zeroDegree) {
      case 0:
        if (
          chordDegrees.data[1] != 1 &&
          reference.data[i + 1] != scale.element(actualDegree + 1) &&
          scale.element(actualDegree + 1) - scale.element(actualDegree) != 1 &&
          scale.element(chordDegrees.data[1]) - scale.element(zeroDegree + 1) != 1
        ) {
          voicing.data.push(actualDegree + 1);
        } else {
          voicing.data.push(actualDegree);
        }
        break;
      case 1:
        voicing.data.push(actualDegree);
        break;
      case 2:
        voicing.data.push(actualDegree);
        break;
      case 3:
        voicing.data.push(actualDegree);
        break;
      case 4:
        if (
          chordDegrees.data[3] != 5 &&
          reference.data[i + 1] == scale.element(actualDegree) &&
          scale.element(voicing.data[0]) - scale.element(actualDegree + 2 - scale.data.length) != 1
        ) {
          voicing.data.push(actualDegree + 1);
        } else {
          voicing.data.push(actualDegree);
        }
        break;
      case 5:
        if (
          i == 1 &&
          scale.element(voicing.data[0]) - scale.element(actualDegree - scale.data.length) == 1
        ) {
          voicing.data.push(actualDegree - 1);
        }
        voicing.data.push(actualDegree);
        break;
      case 6:
        if (
          i == 2 &&
          scale.element(voicing.data[0]) - scale.element(actualDegree - scale.data.length) == 1
        ) {
          voicing.data.push(actualDegree - 1);
        } else {
          voicing.data.push(actualDegree);
        }
        break;
    }
  }

  voicing.rototranslate(1 - voicing.data.length);
  let blockchord = scale.selectFromPosition(voicing);

  if (cluster == true) {
    let j = 0;
    let clusterV: positionVector[] = [];

    for (let i = degree - scale.data.length + 1; i < degree; i++) {
      if (
        scale.element(degree) - scale.element(i) != 1 &&
        !voicing.isNote(i) &&
        !scale.selectFromPosition(chordDegrees).isAvoid(scale.element(i))
      ) {
        // Create a new instance of positionVector by copying the data from 'voicing'
        let candidate = new positionVector([...voicing.data], voicing.modulo, voicing.span);
        candidate.data.push(i);
        candidate.data.sort((a, b) => a - b);
        clusterV.push(candidate);
      } else {
        j++;
      }
    }

    // Assign a score to each candidate
    let scoredCandidates = clusterV.map((candidate) => {
      let score = 0;
      let minLength = Math.min(candidate.data.length, lastChord.data.length);
      for (let i = 0; i < minLength; i++) {
        if (candidate.data[i] == lastChord.data[i]) {
          score -= 1; // Penalize voices that repeat at the same position
        }
      }
      return { candidate, score };
    });

    // Find the maximum score
    let maxScore = Math.max(...scoredCandidates.map((c) => c.score));

    // Select all candidates with the maximum score
    let bestCandidates = scoredCandidates
      .filter((c) => c.score == maxScore)
      .map((c) => c.candidate);

    // If there are multiple candidates with the same score, choose one randomly
    let selectedCandidate;
    if (bestCandidates.length == 1) {
      selectedCandidate = bestCandidates[0];
    } else {
      selectedCandidate = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    }

    return scale.selectFromPosition(selectedCandidate);
  } else {
    return blockchord;
  }
}