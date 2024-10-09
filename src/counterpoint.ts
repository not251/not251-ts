import { toIntervals, toPositions } from "./crossOperation";
import positionVector from "./positionVector";

/**
 * Generates counterpoint based on the given melody and various transformation parameters.
 * Applies inversion, retrograde, or both to the melody as specified.
 *
 * @param scala - The position vector representing the scale.
 * @param root - The root note for the melody.
 * @param octaveShift - The amount to shift the octave for the melody.
 * @param melodyNotes - The notes of the melody to be transformed.
 * @param melodyDurations - The durations of the melody notes.
 * @param melodyRhythm - The rhythm pattern of the melody notes.
 * @param inversion - A boolean indicating whether to apply inversion.
 * @param retrograde - A boolean indicating whether to reverse the melody.
 * @param retrogradeInversion - A boolean indicating whether to apply both retrograde and inversion.
 * @param inversionAxis - The axis for inversion (0 for first note, 1 for median, 2 for last).
 * @param durationScalingFactor - The scaling factor for note durations.
 * @param rhythmScalingFactor - The scaling factor for rhythm.
 * @param subdivisions - The number of subdivisions for rhythm calculations.
 * @param delay - A delay to be added to the rhythm.
 * @param free - A boolean indicating whether to use free inversion.
 * @returns An object containing the transformed notes, durations, and rhythm as arrays of numbers.
 */
export function generateCounterpoint(
  scala: positionVector,
  root: number,
  octaveShift: number,
  melodyNotes: number[],
  melodyDurations: number[],
  melodyRhythm: number[],
  inversion: boolean,
  retrograde: boolean,
  retrogradeInversion: boolean,
  inversionAxis: number,
  durationScalingFactor: number,
  rhythmScalingFactor: number,
  subdivisions: number,
  delay: number,
  free: boolean
): { notes: number[]; durations: number[]; rhythm: number[] } {
  let scale = scala.data;
  let mod = scala.modulo;
  let outNotes = melodyNotes.slice();
  let outDurations = melodyDurations.slice();
  let outRhythm = melodyRhythm.slice();

  if (retrograde) {
    outNotes.reverse();
    for (let i = 0; i < outRhythm.length; i++) {
      outRhythm[i] = subdivisions - outRhythm[i] - outDurations[i];
    }
    outDurations.reverse();
    outRhythm.reverse();
  } else if (inversion) {
    if (free) {
      let toInvert = new positionVector(outNotes, mod, mod);
      outNotes = toInvert.freeInvert(inversionAxis).data;
    } else {
      outNotes = invertMelody(
        outNotes,
        scale,
        root,
        octaveShift,
        inversionAxis,
        mod
      );
    }
  } else if (retrogradeInversion) {
    let invertedNotes: number[] = [];
    if (free) {
      let toInvert = new positionVector(melodyNotes, mod, mod);
      invertedNotes = toInvert.freeInvert(inversionAxis).data;
    } else {
      invertedNotes = invertMelody(
        melodyNotes,
        scale,
        root,
        octaveShift,
        inversionAxis,
        mod
      );
    }
    for (let i = 0; i < outRhythm.length; i++) {
      outRhythm[i] = subdivisions - outRhythm[i] - outDurations[i];
    }
    outDurations.reverse();
    outRhythm.reverse();
    outNotes = invertedNotes;
  }

  outDurations = durationScaler(outDurations, durationScalingFactor);
  outRhythm = rhythmScaler(outRhythm, subdivisions, rhythmScalingFactor);

  for (let i = 0; i < outRhythm.length; i++) {
    outRhythm[i] += delay;
  }

  return {
    notes: outNotes,
    durations: outDurations,
    rhythm: outRhythm,
  };
}

/**
 * Inverts a melody around a specified axis within the given scale.
 * Returns the inverted melody as an array of notes.
 *
 * @param melody - The melody to be inverted.
 * @param scale - The scale used for inversion.
 * @param root - The root note of the melody.
 * @param octaveShift - The amount to shift the octave.
 * @param inversionAxis - The axis around which to invert.
 * @param mod - The modulo for the scale.
 * @param shift - Optional additional shift for degrees (default is 0).
 * @returns The inverted melody as an array of numbers.
 */
export function invertMelody(
  melody: number[],
  scale: number[],
  root: number,
  octaveShift: number,
  inversionAxis: number,
  mod: number,
  shift: number = 0
): number[] {
  let invertedDegrees = [];
  let invertedOctaves = [];
  let axisDegree = 0;
  let axisOctave = 0;
  let degrees, octaves;

  let analyzed = analyzeMelody(scale, root, melody, mod);
  degrees = analyzed.degrees;
  octaves = analyzed.octaves;

  if (inversionAxis == 0) {
    axisDegree = degrees[0];
    axisOctave = octaves[0];
  }
  if (inversionAxis == 2) {
    axisDegree = degrees[degrees.length - 1];
    axisOctave = octaves[octaves.length - 1];
  }
  if (inversionAxis == 1) {
    let medianIndex = Math.floor(degrees.length / 2);
    axisDegree = degrees[medianIndex];
    axisOctave = octaves[medianIndex];
  }

  for (let i = 0; i < degrees.length; i++) {
    let scaleDegree = degrees[i];
    let invertedDegree = 2 * axisDegree - scaleDegree;
    let originalOctave = octaves[i];
    let invertedOctave = 2 * axisOctave - originalOctave + octaveShift;

    while (invertedDegree < 0) {
      invertedDegree += scale.length;
      invertedOctave--;
    }
    while (invertedDegree >= scale.length) {
      invertedDegree -= scale.length;
      invertedOctave++;
    }

    invertedDegrees.push(invertedDegree);
    invertedOctaves.push(invertedOctave);
  }

  return reconstructNotes(
    { degrees: invertedDegrees, octaves: invertedOctaves },
    scale,
    root,
    mod,
    shift
  );
}

/**
 * Analyzes a melody to extract its scale degrees and octaves based on the given scale and root.
 * Returns an object containing arrays of degrees and octaves.
 *
 * @param scale - The scale to analyze against.
 * @param root - The root note of the melody.
 * @param melody - The melody notes to analyze.
 * @param mod - The modulo for the scale.
 * @returns An object with arrays of degrees and octaves, represented as numbers.
 */
export function analyzeMelody(
  scale: number[],
  root: number,
  melody: number[],
  mod: number
): { degrees: number[]; octaves: number[] } {
  let degrees = [];
  let octaves = [];

  for (let i = 0; i < melody.length; i++) {
    let note = melody[i];
    let normalizedNote = (note - root + mod) % mod;
    let degree = scale.indexOf(normalizedNote);
    if (degree === -1) degree = 0;

    let octave = Math.floor((note - root) / 12);
    degrees.push(degree);
    octaves.push(octave);
  }

  return { degrees: degrees, octaves: octaves };
}

/**
 * Reconstructs melody notes from their degrees and octaves based on the provided scale and root.
 * Returns the reconstructed melody as an array of notes.
 *
 * @param degreesAndOctaves - An object containing arrays of degrees and octaves.
 * @param scale - The scale used for reconstruction.
 * @param root - The root note of the melody.
 * @param mod - The modulo for the scale.
 * @param shift - An optional shift value to adjust degrees.
 * @returns An array of note numbers.
 */
export function reconstructNotes(
  degreesAndOctaves: { degrees: number[]; octaves: number[] },
  scale: number[],
  root: number,
  mod: number,
  shift: number
): number[] {
  let degrees = degreesAndOctaves.degrees;
  let octaves = degreesAndOctaves.octaves;
  let notes = [];

  for (let i = 0; i < degrees.length; i++) {
    let scaleDegree = degrees[i] + shift;
    let octave = octaves[i];

    if (scaleDegree >= 0 && scaleDegree < scale.length) {
      let degreeValue = scale[scaleDegree];
      let noteValue = root + octave * mod + degreeValue;
      notes.push(noteValue);
    }
  }

  return notes;
}

/**
 * Scales the duration of each note by the specified scaling factor.
 * Returns an array of scaled durations.
 *
 * @param durations - The original durations of the notes.
 * @param scalingFactor - The scaling factor (in percentage).
 * @returns An array of scaled durations.
 */
export function durationScaler(
  durations: number[],
  scalingFactor: number
): number[] {
  let d = durations.slice();
  var factor = scalingFactor / 100.0;
  for (var i = 0; i < d.length; i++) {
    d[i] *= factor;
  }
  return d;
}

/**
 * Scales the rhythm of the melody based on the specified subdivisions and multiplier.
 * Returns an array of scaled rhythm values.
 *
 * @param s - The original rhythm values.
 * @param subdivisions - The number of subdivisions for rhythm calculations.
 * @param mult - The multiplier for scaling (in percentage).
 * @returns An array of scaled rhythm values.
 */
export function rhythmScaler(
  s: number[],
  subdivisions: number,
  mult: number
): number[] {
  var factor = mult / 100.0;
  var starts = new positionVector(s, subdivisions, subdivisions);
  var intervals = toIntervals(starts);

  for (var i = 0; i < intervals.data.length; i++) {
    intervals.data[i] *= factor;
  }

  starts = toPositions(intervals);
  return starts.data;
}
