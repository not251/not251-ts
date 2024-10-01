import { toIntervals, toPositions } from "./crossOperation";
import positionVector from "./positionVector";

//da fare test
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

//da fare test
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

//da fare test
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

//da fare test
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

//da fare test
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

//da fare test
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
