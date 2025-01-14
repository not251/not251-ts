import { positionVector, inverse_select, lcmPosition } from "./positionVector";
import { intervalVector } from "./intervalVector";
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

function degreeAreasMap(
  scale: positionVector,
  chord: positionVector
) :  [number[], number[], number[], number[]]{
    const scaleDegrees = scale.getIntervalTypes();

    const chordNorm = chord.normalizeToModulo();
    const chordDegTypes = new Set(chordNorm.getIntervalTypes());

    let degreeAreas : [number[], number[], number[], number[]] = [[],[],[],[]];
    for ( let i = 0 ; i < scale.data.length ; i++ ){
    const actual = scaleDegrees[i];
    switch (actual) {
      case "f":
        degreeAreas[0].push(i);
        break;
      case "2min":
        degreeAreas[0].push(i);
        break;
      case "2":
        if(!chordDegTypes.has("3dim")){
          degreeAreas[0].unshift(i)
        } else{
          degreeAreas[1].push(i)
        }
        break;
      case "2aug":
        degreeAreas[0].unshift(i);
      break;
      case "3dim":
        degreeAreas[1].unshift(i);
        break;
      case "3min":
        degreeAreas[1].unshift(i);
        break;
      case "3maj":
        degreeAreas[1].unshift(i);
        break;
      case "3aug":
        degreeAreas[1].unshift(i);
        break;
      case "4":
        if(!chordDegTypes.has("3aug")){
          degreeAreas[1].push(i)
        } else{
          degreeAreas[1].unshift(i)
        }
        break;
      case "4aug":
        if(!chordDegTypes.has("5dim")){
          degreeAreas[1].push(i)
        } else{
          degreeAreas[2].push(i)
        }
        break;
      case "5dim":
        degreeAreas[2].push(i);
        break;
      case "5":
        degreeAreas[2].push(i);
        break;
      case "5aug":
        if(chordDegTypes.has("5aug")){
          degreeAreas[2].unshift(i)
        } else{
          degreeAreas[3].push(i)
        }
        break;
      case "6min":
        if(chordDegTypes.has("5aug")){
          degreeAreas[2].unshift(i)
        } else{
          degreeAreas[2].push(i)
        }
        break;
      case "6":
        if(chordDegTypes.has("7dim")){
          degreeAreas[3].push(i)
        } else {
          degreeAreas[2].push(i)
        }
        break;
      case "6aug":
        if(chordDegTypes.has("7min")){
          degreeAreas[3].push(i)
        } else {
          degreeAreas[2].push(i)
        }
        break;
      case "7dim":
        degreeAreas[3].unshift(i);
        break;
      case "7min":
        degreeAreas[3].unshift(i);
        break;
      case "7maj":
        degreeAreas[3].unshift(i);
        break;
    }
  }
  return degreeAreas
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

export function blockChord(
  scale: positionVector,
  degree: number,
  chord: positionVector,
  lastChord: positionVector,
  cluster: boolean = false
): positionVector {

  let voicing = new positionVector([degree], scale.data.length, scale.data.length);
  
  const chordNorm = chord.normalizeToModulo();  //andrebbe raffinata la scelta di questi gradi
  //const rotScale = scale.rototranslate(inverse_select(getChordName(chordNorm,true).root,scale).data[0],scale.data.length,false);
  const rotScale = scale;
  let degreeAreas : [number[], number[], number[], number[]] = degreeAreasMap(rotScale,chordNorm);
  const octave = Math.trunc(degree / scale.data.length);
  const degreeMod = modulo(degree, scale.data.length);
  let index = -1;
  for (let i = 0; i < 4; i++) {
    if (degreeAreas[i].includes(degreeMod)) {
      index = i;
      break;
    }
  }
  const degreeModValue = scale.element(degreeMod);
  for (let i = 1; i < 4; i++){
    const j = modulo(index - i , 4);
    let voice: number = Infinity;
    let foundVoice = false; // Indica se un voice valido è stato trovato

    for (let k = 0; k < degreeAreas[j].length; k++){
      let candidate = degreeAreas[j][k];
      if (index - i < 0){
        candidate -= scale.data.length;
      }
      const candidateValue = scale.element(candidate);
      if (( i == 1 && degreeModValue - candidateValue < 2) ||
      candidateValue == lastChord.data[4 - i] ||
      scale.isAvoid(scale.element(candidate))){
        console.warn(( i == 1 && degreeModValue - candidateValue < 2),candidateValue == lastChord.data[4 - i],scale.isAvoid(scale.element(candidate)))
        continue;
      }

      voice = candidate + scale.data.length * octave;
      foundVoice = true;
      break;
    }

    if (!foundVoice) {
      console.warn("foundVoice algorithm for value ", i, "j:", j)
      // Fallback in caso nessun voice valido sia trovato
      let firstValue = scale.element(degreeAreas[j][0]);
      if(index - i < 0){
        firstValue -= scale.modulo;
      }
      if ( i == 1) {
        if(!(degreeModValue - firstValue < 2)){
          voice = degreeAreas[j][0];
        } else if(degreeAreas[j].length != 1 && 
        modulo(degreeModValue - scale.element(degreeAreas[j][1]), scale.data.length) < 2) {
          voice = degreeAreas[j][1];
        }else if ( degreeAreas[j].length == 1 && degreeAreas[modulo(j-1,4)].length > 1) {  // se è possibile "rubare" dall'area j-1 il valore più grande allora bene
          const nextJ = modulo(j-1,4);
          const indexJ = degreeAreas[nextJ].length - 1;
          voice = degreeAreas[nextJ][indexJ];
          degreeAreas[j].push(voice)
          degreeAreas[nextJ].splice(indexJ,1);
          if( index < j - 1){
            voice -= scale.data.length;
          }
        } else {
          const nextJ = modulo(j-1,4);
          const indexJ = degreeAreas[nextJ].length - 1;
          voice = degreeAreas[nextJ][indexJ];
        }
      }
      voice += scale.data.length * octave; 
    }
    voicing.data.unshift(voice);
  }

  let blockchord = scale.selectFromPosition(voicing);

  if (cluster == true) {
    let j = 0;
    let clusterV: positionVector[] = [];

    for (let i = degree - scale.data.length + 1; i < degree; i++) {
      if (
        scale.element(degree) - scale.element(i) != 1 &&
        !voicing.isNote(i) &&
        !scale.selectFromPosition(chordNorm).isAvoid(scale.element(i))
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
export class VoiceRange {
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
export const VoiceRanges: VoiceRange[] = [
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
export function spread(
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
  let highestCandidateInf: number = Math.trunc(
    highestInstrument.range[0] / chordDegrees.modulo
  );
  let higherReference: number;

  if (topDegree === undefined) {
    // If topDegree is undefined, assign the highest note of the spread within the correct range
    if (lastChord === undefined) {
      // The reference is in the middle register of the instrument
      higherReference =
        (highestInstrument.range[1] + highestInstrument.range[0]) / 2;
    } else {
      // The reference is the previous note
      console.log("1");
      higherReference = inverse_select(lastChord, scale).data[
        lastChord.data.length - 1
      ];
    }

    while (scale.element(highestCandidateInf) <= higherReference) {
      highestCandidateInf++;
    }
    let highestCandidateSup = highestCandidateInf;

    // Center the lower candidate on a chord degree
    while (
      !chordDegreesSet.has(modulo(highestCandidateInf, chordDegrees.modulo)) ||
      scale.element(highestCandidateInf) > highestInstrument.range[1]
    ) {
      highestCandidateInf--;
    }

    // Center the upper candidate on a chord degree
    while (
      !chordDegreesSet.has(modulo(highestCandidateSup, chordDegrees.modulo)) ||
      scale.element(highestCandidateSup) < highestInstrument.range[0]
    ) {
      highestCandidateSup++;
    }

    let topNoteCandidate;

    // Choose the best candidate
    if (
      Math.abs(higherReference - scale.element(highestCandidateInf)) <=
      Math.abs(higherReference - scale.element(highestCandidateSup))
    ) {
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
    let bassReference =
      lastChord === undefined
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
      if (
        Math.abs(scale.element(possibleBasses[i]) - bassReference) <=
          distance &&
        !(
          Math.abs(scale.element(possibleBasses[i])) - topNote >=
          scale.modulo * 1.5
        )
      ) {
        distance = Math.abs(scale.element(possibleBasses[i]) - bassReference);
        bassNote = possibleBasses[i];
      } else {
        if (
          chordDegreesSet.has(5) &&
          Math.abs(scale.element(possibleBasses[0])) - topNote <
            scale.modulo * 1.5
        ) {
          chordDegreesSet.delete(5);
        }
      }
    }
  } else {
    // If the bass is present, assign the bass of the spread in the correct range not lower than bassDegree
    let bassNoteCandidate = scale.element(bassDegree);

    // Ensure bassNoteCandidate is not lower than the original bassDegree
    const originalBassNote = scale.element(bassDegree);
    while (
      bassNoteCandidate < originalBassNote ||
      !lowestInstrument.inRange(bassNoteCandidate)
    ) {
      bassNoteCandidate += scale.modulo;
    }

    bassNote = bassNoteCandidate;
  }

  let candidatesPv = new positionVector(
    [bassNote, topNote],
    scale.data.length,
    scale.data.length
  );
  usedDegrees.add(
    modulo(inverse_select(candidatesPv, scale).data[0], scale.data.length)
  );
  usedDegrees.add(
    modulo(inverse_select(candidatesPv, scale).data[1], scale.data.length)
  );

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
    essentialDegrees.add(0); // Third
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

      if (
        instruments[voice].inRange(actualtNote) &&
        !(voice == 1 && actualtNote < 50 && actualtNote - bassNote < 7) &&
        !(voice == voices - 2 && actualtNote - topNote > 1) &&
        !(
          scale.isExtension(actualtNote) &&
          actualtNote - bassNote < scale.modulo
        )
      ) {
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
      innerVoicesTar[i] =
        Math.round((topNote - bassNote) / (voices - 1)) * (i + 1) + bassNote;
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
  // Filter combinations that do not respect possibilities for each voice, contain essentialDegrees, or have distances between voices greater than scale.modulo
  const validCombinations = innerVoiceCombinations.filter((combination) => {
    const combinationSet = new Set<number>(
      combination.map((note) =>
        modulo(
          inverse_select(
            new positionVector([note], scale.data.length, scale.data.length),
            scale
          ).data[0],
          scale.data.length
        )
      )
    );
    return (
      combination.every((note, index) => possibilities[index].includes(note)) &&
      Array.from(essentialDegrees).every((degree) =>
        combinationSet.has(degree)
      ) &&
      combination.every(
        (note, index) =>
          index === 0 || note - combination[index - 1] <= scale.modulo
      )
    );
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

/**
 * Analyzes a `positionVector` representing a chord, identifying its name and root.
 * The function supports complex chords, including slash chords, by determining the
 * chord's quality (e.g., major, minor, diminished) and any extensions.
 *
 * @param chordVector - The `positionVector` representing the chord to analyze.
 * @param allowSlashChords - A boolean indicating whether to allow slash chords (default: false).
 * @returns An object containing:
 *   - `chordName`: The name of the chord as a string.
 *   - `root`: The root of the chord as a `positionVector`, calculated as the lowest note of the selected candidate.
 */
export function getChordName(
  chordVector: positionVector,
  allowSlashChords = false
) {
  let chord = chordVector;
  chord = chord.sum(-chordVector.data[0]);

  for (let i = 1; i < chord.data.length; i++) {
    chord.data[i] = modulo(chord.data[i], chord.modulo);
  }
  chord.data.sort((a, b) => a - b);
  chord = chord.sum(+chordVector.data[0]);

  let candidates = [];
  let iTcandidates = [];
  let chordNames: [positionVector, string, string[], string][] = [];
  let length = 1;
  if (allowSlashChords) {
    length = chordVector.data.length;
  }

  for (let i = 0; i < length; i++) {
    let candidate = chord.rototranslate(i, chord.data.length, false);
    if (candidate.isExtension(chord.element(0)) && i != 0) {
      candidate.data.splice(chord.data.length - i, 1);
    }

    let iTCandidate = new Set(candidate.getIntervalTypes());

    iTcandidates.push(iTCandidate);
    candidates.push(candidate);

    let chordBase = "";
    let chordQuality = [];
    let inversion = "";

    // Determine the basic chord quality
    if (iTCandidate.has("5aug")) {
      chordBase = "+";
    }
    if (iTCandidate.has("3min")) {
      if (iTCandidate.has("5dim")) {
        chordBase = "dim";
      } else {
        chordBase = "-";
      }
    } else if (
      !iTCandidate.has("3maj") &&
      !iTCandidate.has("3min") &&
      iTCandidate.has("3dim") &&
      iTCandidate.has("3aug")
    ) {
      chordBase = "5";
    }

    // Add seventh, sixth, or extended notes to the chord quality
    if (iTCandidate.has("7maj")) {
      chordBase += "maj7";
    } else if (iTCandidate.has("7min")) {
      if (chordBase == "dim") {
        chordBase = "ø";
      }
      chordBase += "7";
    } else if (iTCandidate.has("7dim")) {
      if (chordBase != "dim") {
        chordBase += "6";
      } else {
        chordBase += "7";
      }
    }

    if (iTCandidate.has("4") && iTCandidate.has("3dim")) {
      chordQuality.push("sus2/4");
    } else if (iTCandidate.has("3aug")) {
      chordQuality.push("sus4");
    } else if (iTCandidate.has("3dim")) {
      chordQuality.push("sus2");
    }

    // Add extended notes to the chord quality
    if (iTCandidate.has("2min")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♭9");
      } else {
        chordQuality.push("♭9");
      }
    }
    if (iTCandidate.has("2")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add9");
      } else {
        chordQuality.push("9");
      }
    }
    if (iTCandidate.has("2aug")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♯9");
      } else {
        chordQuality.push("♯9");
      }
    }
    if (iTCandidate.has("4") && !iTCandidate.has("3dim")) {
      if (
        (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) ||
        iTCandidate.has("3maj")
      ) {
        chordQuality.push("add11");
      } else {
        chordQuality.push("11");
      }
    }
    if (iTCandidate.has("4aug")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♯11");
      } else {
        chordQuality.push("♯11");
      }
    }
    if (iTCandidate.has("6min")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♭13");
      } else {
        chordQuality.push("♭13");
      }
    }
    if (iTCandidate.has("6")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add13");
      } else {
        chordQuality.push("13");
      }
    }
    if (iTCandidate.has("6aug")) {
      chordQuality.push("♯13");
    }
    if (
      !iTCandidate.has("3maj") &&
      !iTCandidate.has("3min") &&
      !iTCandidate.has("3aug") &&
      !iTCandidate.has("3dim")
    ) {
      chordQuality.push("omit3");
    }
    if (
      !iTCandidate.has("5") &&
      !iTCandidate.has("5dim") &&
      !iTCandidate.has("5aug")
    ) {
      chordQuality.push("omit5");
    }

    // Assign the root as the lowest note of the candidate
    const root = new positionVector(
      [candidate.data[0]],
      chordVector.modulo,
      chordVector.span
    );

    // Determine inversion if applicable and if slash chords are allowed
    if (allowSlashChords && i !== 0) {
      inversion = `/${scaleNames(chord, false, false, true)[0]}`;
    }

    // Store the chord components in an array
    chordNames.push([root, chordBase, chordQuality, inversion]);
  }

  // Sort chord names based on the length of chordQuality
  chordNames.sort((a, b) => {
    const qualityDifference = a[2].length - b[2].length;
    const inversionPenaltyA = a[3] != undefined ? 1 : 0;
    const inversionPenaltyB = b[3] != undefined ? 1 : 0;

    return qualityDifference !== 0
      ? qualityDifference
      : inversionPenaltyA - inversionPenaltyB;
  });

  let i = 0;
  while (
    i < chordNames.length &&
    (chordNames[i][2].includes("omit3") ||
      (chordNames[i][2].includes("omit5") &&
        (chordNames[i][2].includes("sus2") ||
          chordNames[i][2].includes("sus4"))) ||
      (chordNames[i][2].includes("sus2") &&
        chordNames[i][2].includes("add♭9")) ||
      (chordNames[i][2].includes("sus4") && chordNames[i][2].includes("♯11")))
  ) {
    i++;
  }
  if (i >= chordNames.length) {
    i = 0;
  }

  const bestChord = chordNames[i];

  // Generate the chord name using scaleNames for the output
  const chordName = `${scaleNames(bestChord[0], false, false)[0]}${bestChord[1]}${Array.isArray(bestChord[2]) && bestChord[2].length > 0 ? bestChord[2].join("") : ""}${bestChord[3]}`;

  // Return the chord name and the calculated root as a positionVector
  return {
    chordName,
    root: bestChord[0].normalizeToModulo(),
  };
}

//andrebbe aggiornata questa funzione in positionVector
/**
 * Function: scaleNames
 *
 * Generates an array of strings representing the names of the notes in a musical scale.
 * The function adjusts the notes based on their position relative to a standard scale,
 * handles enharmonic equivalents, and optionally displays deviations in cents or microtonal symbols.
 *
 * @param {positionVector} scala - An object representing the musical scale as a position vector.
 * @param {boolean} [ita=true] - Whether to use Italian notation ("Do, Re, Mi") or English notation ("C, D, E").
 * @param {boolean} [useCents=false] - Whether to include deviations in cents for altered notes.
 * @param {boolean} [checkEnharmonic=true] - Whether to enable adjustments for enharmonic equivalents.
 * @returns {string[]} - An array of note names with appropriate alterations or deviations.
 */
export function scaleNames(
  scala: positionVector,
  ita: boolean = true,
  useCents: boolean = false,
  checkEnharmonic: boolean = true,
  isChord: boolean = false
): string[] {
  const noteItaliane: string[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
  const noteInglesi: string[] = ["C", "D", "E", "F", "G", "A", "B"];
  const noteNames = ita ? noteItaliane : noteInglesi;
  const standard = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12); // Major scale intervals in semitones
  const intervalStandard = new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);

  // Align the input scale with the standard scale
  let scales = lcmPosition(standard, scala);
  let lcmStandard = scales[0];
  let newScale = scales[1];

  // Determine the reference octave
  let octave = Math.floor(newScale.data[0] / newScale.modulo) * newScale.modulo;
  const octaveZeroScale = newScale.sum(-octave); // Normalize scale to one octave

  let index = 0;
  let finalScale = octaveZeroScale;
  let root = 0;

  if (isChord) {
    root = inverse_select(getChordName(finalScale, true).root, finalScale)
      .data[0];
    finalScale = finalScale.rototranslate(root);
  }
  if (lcmStandard.element(index) < finalScale.data[0]) {
    while (lcmStandard.element(index) < finalScale.data[0]) {
      index++;
    }
  } else {
    while (lcmStandard.element(index) >= finalScale.data[0]) {
      index--;
    }
  }
  let preDegrees = finalScale.getDegrees();
  // Get degrees and prepare for enharmonic adjustment
  let noteDegrees1 = preDegrees;
  let noteDegrees2 = preDegrees;
  let steps1 = [];
  let steps2 = [];
  let runningTotal1 = 0;
  let runningTotal2 = 0;

  for (let i = 0; i < finalScale.data.length; i++) {
    const oct =
      Math.floor(
        (finalScale.data[i] - finalScale.data[0]) / finalScale.modulo
      ) * 7;

    // Calculate deviations for the first check
    steps1[i] =
      finalScale.data[i] - lcmStandard.element(noteDegrees1[i] + index + oct);
    runningTotal1 += steps1[i];

    // Calculate deviations for the second check
    steps2[i] =
      finalScale.data[i] -
      lcmStandard.element(noteDegrees2[i] + index + oct + 1);
    runningTotal2 += steps2[i];
  }

  // Choose the best set of adjustments based on total deviation
  let steps =
    Math.abs(runningTotal1) <= Math.abs(runningTotal2) ? steps1 : steps2;
  let noteDegrees =
    Math.abs(runningTotal1) <= Math.abs(runningTotal2)
      ? noteDegrees1
      : noteDegrees2;
  if (Math.abs(runningTotal1) > Math.abs(runningTotal2)) index++;

  if (checkEnharmonic) {
    for (let i = 0; i < steps.length; i++) {
      const su = intervalStandard.element(noteDegrees[i] + index);
      const giu = intervalStandard.element(noteDegrees[i] + index - 1);
      if (Math.abs(steps[i]) >= su && Math.sign(steps[i]) == +1) {
        steps[i] -= intervalStandard.element(noteDegrees[i] + index);
        noteDegrees[i] += 1;
      } else if (Math.abs(steps[i]) >= giu && Math.sign(steps[i]) == -1) {
        steps[i] += intervalStandard.element(noteDegrees[i] + index - 1);
        noteDegrees[i] -= 1;
      }
    }
  }

  // Generate the final note names with alterations or deviations
  let names = [];
  for (let i = 0; i < noteDegrees.length; i++) {
    const j = modulo(i - root, steps.length);
    const actualStep = steps[j];
    const actualBaseName = noteNames[modulo(noteDegrees[j] + index, 7)];
    if (useCents) {
      const cents = Math.round(actualStep * 50);
      if (cents !== 0) {
        names[i] =
          `${actualBaseName} ${cents > 0 ? "\u2191" : "\u2193"}${Math.abs(cents)}\u00a2`;
      } else {
        names[i] = actualBaseName;
      }
    } else {
      const roundedSteps = Math.round(actualStep);
      if (Math.abs(actualStep) < 1 && actualStep !== 0) {
        names[i] =
          actualBaseName + (actualStep > 0 ? "\uD834\uDD32" : "\uD834\uDD33"); // Microtonal symbols
      } else if (roundedSteps !== 0) {
        const alteration = roundedSteps > 0 ? "\u266F" : "\u266D"; // Sharp or flat
        names[i] =
          actualBaseName +
          alteration.repeat(Math.min(Math.abs(roundedSteps), 2));
      } else {
        names[i] = actualBaseName;
      }
    }
  }
  return names;
}
