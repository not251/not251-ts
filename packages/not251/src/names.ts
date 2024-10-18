import positionVector, { inverse_select } from "./positionVector";
import intervalVector from "./intervalVector";
import { modulo , lcm } from "./utility";
import { minRotation} from "./distances";
import { chord } from "./chord";

const noteItaliane: string[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const noteInglesi: string[]= ["C", "D", "E", "F", "G", "A", "B"];

/**
 * Generates the note names corresponding to the values of a scale.
 * It matches each value to the closest note in a standard scale,
 * applying necessary alterations (sharps, flats, microtonal symbols, or cents deviations).
 *
 * @param scala - A positionVector representing the scale to analyze.
 * @param ita - If true, uses Italian note names; otherwise, uses English note names (default is true).
 * @param useCents - If true, uses cent deviations for microtonal adjustments (default is false).
 * @returns An array of strings containing the note names corresponding to the scale values.
 */

export function scaleNames(
  scala: positionVector,
  ita: boolean = true,
  useCents: boolean = false
): string[] {
  const centsPerOctave = 600; // As per your definition
  const centsPerSemitone = 50; // 600 cents / 12 semitones
  const semitoneValue = scala.modulo / 12; // Each semitone in terms of modulo
  const noteNames = ita ? noteItaliane : noteInglesi;
  const standardDegrees = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals in semitones
  // Determine the key (starting note)
  const keyValue = modulo(scala.data[0], scala.modulo);
  let keyIndex = Math.round((keyValue / scala.modulo) * 12) % 12;

  // Find the closest note name to the key
  let minDiff = Infinity;
  let keyNoteIndex = 0;
  for (let i = 0; i < standardDegrees.length; i++) {
    const degree = standardDegrees[i];
    const refValue = (degree * scala.modulo) / 12;
    const diff = Math.abs(refValue - keyValue);
    if (diff < minDiff) {
      minDiff = diff;
      keyNoteIndex = i;
    }
  }

  // Rotate noteNames and standardDegrees to match the key
  const rotatedNoteNames = noteNames
    .slice(keyNoteIndex)
    .concat(noteNames.slice(0, keyNoteIndex));
  const rotatedDegrees = standardDegrees
    .slice(keyNoteIndex)
    .concat(standardDegrees.slice(0, keyNoteIndex));

  const usedNotes = new Set<string>(); // To prevent duplicate note names

  return scala.data.map((value, idx) => {
    let bestBaseName = "";
    let minScore = Infinity;
    let bestSteps = 0;
    let bestAccidentals = 0;

    // Consider degrees within ±2 of the expected degree
    for (let degreeOffset = -2; degreeOffset <= 2; degreeOffset++) {
      let degreeIndex =
        (idx + degreeOffset + rotatedDegrees.length) % rotatedDegrees.length;
      const degree = rotatedDegrees[degreeIndex];
      const baseName = rotatedNoteNames[degreeIndex];

      // Try octave offsets to find the closest reference value
      for (let octaveOffset = -1; octaveOffset <= 1; octaveOffset++) {
        const refValue = (degree * scala.modulo) / 12 + octaveOffset * scala.modulo;
        const diff = value - refValue;
        const steps = diff / semitoneValue; // Difference in semitones
        const absSteps = Math.abs(steps);

        if (absSteps <= 1) {
          // Limit adjustments to within one semitone (±50 cents)
          const roundedSteps = Math.round(steps * 2) / 2; // Round to nearest 0.5 for quarter tones
          const accidentals = Math.abs(roundedSteps);
          const penalty = usedNotes.has(baseName) ? 1 : 0;
          const score =
            absSteps +
            accidentals +
            penalty +
            Math.abs(degreeOffset) * 0.5; // Penalize distant degrees

          if (score < minScore) {
            minScore = score;
            bestBaseName = baseName;
            bestSteps = steps;
            bestAccidentals = roundedSteps;
          }
        }
      }
    }

    // If no suitable note is found, return a placeholder
    if (bestBaseName === "") {
      return "?";
    }

    usedNotes.add(bestBaseName);

    // Generate the note name with appropriate alterations
        if (useCents) {
      const cents = Math.round(bestSteps * 50);
      if (cents !== 0) {
        return `${bestBaseName} ${cents > 0 ? "↑" : "↓"}${Math.abs(cents)}¢`;
      }
      return bestBaseName;
    } else {
      const roundedSteps = Math.round(bestSteps);
      if (Math.abs(bestSteps) < 1 && bestSteps !== 0) {
        return bestBaseName + (bestSteps > 0 ? "𝄲" : "𝄳"); // Microtonal symbols
      } else if (roundedSteps !== 0) {
        const alteration = roundedSteps > 0 ? "♯" : "♭";
        return bestBaseName + alteration.repeat(Math.min(Math.abs(roundedSteps), 2));
      }
      return bestBaseName;
    }
  });
}

/**
 * funzione per visualizzare web chord notes
 */
let scala = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);
let chordNotes = chord({scala: scala});

let index_chord = inverse_select(chordNotes, scala);

let nomi_scala = scaleNames(scala);

for (let i = 0; i < index_chord.data.length; i++) {
  console.log(nomi_scala[index_chord.data[i]]);
}

