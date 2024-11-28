import positionVector, { inverse_select } from "./positionVector";
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
 * Generates a block chord based on the given **scale**, **degree**, and **chordDegrees**.
 * The function considers the **lastChord** for voice leading and can generate cluster chords if specified.
 *
 * - It determines the voicing based on the degree function of the scale.
 * - **Now supports scales of variable lengths**, enhancing flexibility.
 * - It selects notes to avoid voice repetition and avoid notes.
 * - If `cluster` is `true`, it generates a five-voice block chord by adding appropriate notes.
 *
 * @param scale - The scale as a **positionVector**, which can have a variable length, with a modulo and span of 12.
 * @param degree - The degree of the lead.
 * @param chordDegrees - The degrees of the chord within the scale, represented as a **positionVector** (e.g., `[0, 2, 4, 6]`) with `scale.data.length` as the modulo.
 * @param lastChord - The previous chord as a **positionVector** for comparison.
 * @param cluster - If `true`, generates a block chord with five voices (default is `false`).
 * @returns A **positionVector** representing the generated block chord.
 */

function generateBlockChord(
  scale: positionVector,
  degree: number,
  chordDegrees: positionVector,
  lastChord: positionVector,
  cluster: boolean = false
): positionVector {
  let voicing = new positionVector([degree], scale.data.length, scale.data.length);

  const reference = lastChord.data;
  let index = -1;

  let degFunc = scale.getDegrees()[modulo(degree, scale.data.length)];
  if (degFunc == 0 || (degFunc == 1 && chordDegrees.data[1] != 1)) {
    index = 0;
  } else if (
    (degFunc == 1 && chordDegrees.data[1] == 1) ||
    degFunc == 2 ||
    degFunc == 3
  ) {
    index = 1;
  } else if (degFunc == 4 || (degFunc == 5 && chordDegrees.data[3] != 6)) {
    index = 2;
  } else {
    index = 3;
  }

  let octave = Math.floor(degree / voicing.modulo) * voicing.modulo;

  for (let i = 1; i < 4; i++) {
    let actualDegree = chordDegrees.element(index - i) + octave;
    let scaleDegreeFunction = scale.getDegrees();
    let zeroDegree = scaleDegreeFunction[modulo(actualDegree, scale.data.length)];
    let chord = scale.selectFromPosition(chordDegrees);
    switch (zeroDegree) {
      case 0:
        if (
          scaleDegreeFunction[modulo(actualDegree + 1, scale.data.length)] != 2 && // If the next degree is not a third
          chordDegrees.data[1] != 1 && // If the chord is not sus2
          reference[reference.length - i - 1] != scale.element(actualDegree + 1) && // If the note is not repeated
          !chord.isAvoid(scale.element(1)) // If the next note is not an avoid note
        ) {
          voicing.data.push(actualDegree + 1); // Increase the degree
        } else {
          voicing.data.push(actualDegree); // Otherwise, add the fundamental
        }
        break;
      case 1:
        voicing.data.push(actualDegree); // Add the second
        break;
      case 2:
        voicing.data.push(actualDegree); // Add the third
        break;
      case 3:
        voicing.data.push(actualDegree); // Add the fourth
        break;
      case 4:
        if (
          scaleDegreeFunction[modulo(actualDegree + 1, scale.data.length)] != 6 && // If the next degree is not a seventh
          chordDegrees.data[3] != 5 && // If the base chord is not a sixth
          reference[reference.length - i - 1] == scale.element(actualDegree) && // If the note is repeated
          !chord.isAvoid(scale.element(actualDegree + 1)) && // If the next degree is not an avoid note
          voicing.data[1] != (actualDegree + 1) // If the next degree is not the same as the previous one
        ) {
          voicing.data.push(actualDegree + 1);  // Add the next degree
        } else {
          voicing.data.push(actualDegree);  // Add the current degree
        }
        break;
      case 5:
        voicing.data.push(actualDegree);  // Add the current degree
        break;
      case 6:
        if (
          i == 1 &&
          scale.element(voicing.data[0]) - scale.element(actualDegree) == 1 // If the actual degree is at half step from the lead note
        ) {
          voicing.data.push(actualDegree - 1);
        } else {
          voicing.data.push(actualDegree);
        }
        break;
    }
  }

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

/**
 * Represents the range of a musical voice or instrument.
 * This class is used to determine if a given note is within the playable range for a particular voice or instrument.
 * 
 * @param name - The name of the voice or instrument (e.g., "soprano").
 * @param range - A tuple representing the minimum and maximum MIDI note numbers that the voice can produce.
 */
class VoiceRange {
  name: string;
  range: [number, number];

  constructor(name: string, range: [number, number]) {
    this.name = name;
    this.range = range;
  }

  /**
   * Checks if a given note is within the voice's range.
   * 
   * @param num - The MIDI note number to check.
   * @returns A boolean indicating whether the note is in range.
   */
  inRange(num: number): boolean {
    return num >= this.range[0] && num <= this.range[1];
  }
}

/**
 * Predefined voice ranges for common vocal types.
 * Each VoiceRange represents a vocal type (e.g., "soprano") with a defined range of MIDI notes.
 */
const VoiceRanges: VoiceRange[] = [
  new VoiceRange("soprano", [60, 84]),
  new VoiceRange("mezzosoprano", [57, 83]),
  new VoiceRange("contralto", [53, 79]),
  new VoiceRange("tenore", [48, 72]),
  new VoiceRange("baritono", [45, 67]),
  new VoiceRange("basso", [40, 64]),
];


/**
 * Spreads a chord based on the given scale, chord degrees, and instrument ranges.
 * This function distributes the chord notes across the provided instruments, determining the top note and bass note to achieve a well-balanced spread.
 * 
 * @param scale - The musical scale represented as a **positionVector**.
 * @param chordDegrees - The degrees of the chord within the scale as a **positionVector**.
 * @param instruments - An array of **VoiceRange** objects representing the ranges of the instruments.
 * @param topDegree - (Optional) The degree for the top note.
 * @param bassDegree - (Optional) The degree for the bass note.
 * @param lastChord - (Optional) The previous chord represented as a **positionVector** for smoother transitions.
 * @returns A **positionVector** representing the assigned notes for the chord spread.
 */
function spread(
  scale: positionVector,
  chordDegrees: positionVector,
  instruments: VoiceRange[],
  topDegree?: number,
  bassDegree?: number,
  lastChord?: positionVector
): positionVector {
  // Sort instruments according to the lowest note they can play
  instruments.sort((a, b) => a.range[0] - b.range[0]);
  const chordDegreesSet = new Set(chordDegrees.data);
  let usedDegrees = new Set();

  // Ensure the number of voices does not exceed the number of instruments
  let voices = instruments.length;

  // Determine the top note
  let topNote: number;
  const highestInstrument = instruments[voices - 1];
  let highestCandidateInf: number = Math.trunc(highestInstrument.range[0] / chordDegrees.modulo);
  let higherReference: number;

  if (topDegree === undefined) {
    // If topDegree is undefined, assign the highest note of the spread within the correct range
    if (lastChord === undefined) {
      // The reference is in the middle register of the instrument
      higherReference = (highestInstrument.range[1] + highestInstrument.range[0]) / 2;
    } else {
      // The reference is the previous note
      console.log("1");
      higherReference = inverse_select(lastChord, scale).data[lastChord.data.length - 1];
    }

    while (scale.element(highestCandidateInf) <= higherReference) {
      highestCandidateInf++;
    }
    let highestCandidateSup = highestCandidateInf;

    // Center the lower candidate on a chord degree
    while (!chordDegreesSet.has(modulo(highestCandidateInf, chordDegrees.modulo)) || scale.element(highestCandidateInf) > highestInstrument.range[1]) {
      highestCandidateInf--;
    }

    // Center the upper candidate on a chord degree
    while (!chordDegreesSet.has(modulo(highestCandidateSup, chordDegrees.modulo)) || scale.element(highestCandidateSup) < highestInstrument.range[0]) {
      highestCandidateSup++;
    }

    let topNoteCandidate;

    // Choose the best candidate
    if (Math.abs(higherReference - scale.element(highestCandidateInf)) <= Math.abs(higherReference - scale.element(highestCandidateSup))) {
      topNoteCandidate = scale.element(highestCandidateInf);
    } else {
      topNoteCandidate = scale.element(highestCandidateSup);
    }

    topNote = topNoteCandidate;
  } else {
    // Otherwise, set topNote to be exactly equal to topDegree
    topNote = scale.element(topDegree);
  }

  // Determine the bass note
  let bassNote = scale.element(0);
  const lowestInstrument = instruments[0];

  if (bassDegree === undefined) {
    // If the bass is undefined, assign the bass of the spread to the fundamental adjusted into the correct range
    let fundamentalNote = scale.element(0);

    // Start from a comfortable note, one octave below the center of the range
    let bassReference = lastChord === undefined
      ? (lowestInstrument.range[0] + lowestInstrument.range[1]) / 2
      : lastChord.data[0];

    while (fundamentalNote >= lowestInstrument.range[0]) {
      fundamentalNote -= scale.modulo;
    }
    let possibleBasses = [];

    while (fundamentalNote <= lowestInstrument.range[1]) {
      if (lowestInstrument.inRange(fundamentalNote)) {
        possibleBasses.push(fundamentalNote);
      }
      fundamentalNote += scale.modulo;
    }
    let distance = Infinity;
    // Adjust fundamentalNote into the instrument's range
    bassNote = possibleBasses[0];
    for (let i = 0; i < possibleBasses.length; i++) {
      if (Math.abs(scale.element(possibleBasses[i]) - bassReference) <= distance &&
        !((Math.abs(scale.element(possibleBasses[i])) - topNote) >= (scale.modulo * 1.5))) {
        distance = Math.abs(scale.element(possibleBasses[i]) - bassReference);
        bassNote = possibleBasses[i];
      } else {
        if (chordDegreesSet.has(5) && ((Math.abs(scale.element(possibleBasses[0])) - topNote) < (scale.modulo * 1.5))) {
          chordDegreesSet.delete(5);
        }
      }
    }
  } else {
    // If the bass is present, assign the bass of the spread in the correct range not lower than bassDegree
    let bassNoteCandidate = scale.element(bassDegree);

    // Ensure bassNoteCandidate is not lower than the original bassDegree
    const originalBassNote = scale.element(bassDegree);
    while (bassNoteCandidate < originalBassNote || !lowestInstrument.inRange(bassNoteCandidate)) {
      bassNoteCandidate += scale.modulo;
    }

    bassNote = bassNoteCandidate;
  }

  let candidatesPv = new positionVector([bassNote, topNote], scale.data.length, scale.data.length);
  usedDegrees.add(modulo(inverse_select(candidatesPv, scale).data[0], scale.data.length));
  usedDegrees.add(modulo(inverse_select(candidatesPv, scale).data[1], scale.data.length));

  let candateDegrees = inverse_select(candidatesPv, scale);
  // Now assign notes to each voice
  let possibleDegrees: number[] = [];
  for (let i = candateDegrees.data[0] + 1; i < candateDegrees.data[1]; i++) {
    if (chordDegreesSet.has(modulo(i, scale.data.length))) {
      possibleDegrees.push(i);
    }
  }
  let result = [bassNote];

  let possibilities: number[][] = Array.from({ length: voices - 2 }, () => []);

  let essentialDegrees = new Set<number>();
  if (chordDegreesSet.has(0) && !usedDegrees.has(0)) {
    essentialDegrees.add(0); // Root
  }
  if (chordDegreesSet.has(2) && !usedDegrees.has(2)) {
    essentialDegrees.add(2); // Third
  }
  if (chordDegreesSet.has(6) && !usedDegrees.has(6)) {
    essentialDegrees.add(6); // Seventh
  } else if (chordDegreesSet.has(5) && !usedDegrees.has(5)) {
    essentialDegrees.add(5); // Sixth if the seventh is not present
  }
  if (!essentialDegrees.has(2) && chordDegreesSet.has(1)) {
    essentialDegrees.add(1); // Second if the third is not present
  }

  for (let voice = 1; voice < voices - 1; voice++) {
    for (let possibleDegree of possibleDegrees) {
      let actualtNote = scale.element(possibleDegree);

      if (instruments[voice].inRange(actualtNote) &&
        !((voice == 1) && actualtNote < 50 && (actualtNote - bassNote) < 7) &&
        !((voice == voices - 2) && (actualtNote - topNote) > 1) &&
        !(scale.isExtension(actualtNote) && (actualtNote - bassNote < scale.modulo))) {
        possibilities[voice - 1].push(actualtNote);
      }
    }
    if (possibilities[voice - 1].length === 0) {
      console.warn(`Voice ${voice} has no possible degrees within range.`);
    }
  }

  let innerVoicesTar: number[] = [];
  if (lastChord == undefined) {
    for (let i = 0; i < voices - 2; i++) {
      innerVoicesTar[i] = Math.round((topNote - bassNote) / (voices - 1)) * (i + 1) + bassNote;
    }
  } else {
    for (let i = 0; i < voices - 2; i++) {
      innerVoicesTar[i] = lastChord.data[i + 1];
    }
  }

  // Generate all possible combinations for inner voices, respecting ascending order
  function generateCombinations(possibilities: number[][]): number[][] {
    let results: number[][] = [];

    function backtrack(current: number[], depth: number) {
      if (depth === possibilities.length) {
        results.push([...current]);
        return;
      }

      for (let note of possibilities[depth]) {
        if (current.length === 0 || note > current[current.length - 1]) {
          current.push(note);
          backtrack(current, depth + 1);
          current.pop();
        }
      }
    }

    backtrack([], 0);
    return results;
  }

  const innerVoiceCombinations = generateCombinations(possibilities);
  // Filter combinations that do not respect possibilities for each voice and contain essentialDegrees
  const validCombinations = innerVoiceCombinations.filter(combination => {
    const combinationSet = new Set(combination.map(note => modulo(inverse_select(new positionVector([note], scale.data.length, scale.data.length), scale).data[0], scale.data.length)));
    return combination.every((note, index) => possibilities[index].includes(note)) && Array.from(essentialDegrees).every(degree => combinationSet.has(degree));
  });
  // Select the combination that best matches innerVoicesTar (i.e., is closest)
  function calculateDistance(combination: number[], target: number[]): number {
    let distance = 0;
    for (let i = 0; i < combination.length; i++) {
      distance += Math.abs(combination[i] - target[i]);
    }
    return distance;
  }

  let bestCombination = validCombinations[0];
  let minDistance = calculateDistance(validCombinations[0], innerVoicesTar);

  for (let combination of validCombinations) {
    const distance = calculateDistance(combination, innerVoicesTar);
    if (distance < minDistance) {
      minDistance = distance;
      bestCombination = combination;
    }
  }

  // Add the best combination to the result notes
  result.push(...bestCombination);

  result.push(topNote);

  // Return the assigned notes as a positionVector
  return new positionVector(result, scale.modulo, scale.modulo);
}
