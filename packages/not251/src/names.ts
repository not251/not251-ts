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
  const modulo = scala.modulo;
  const semitoneValue = modulo / 12;
  const noteNames = ita ? noteItaliane : noteInglesi;
  const noteDegrees = [0, 2, 4, 5, 7, 9, 11];
  const usedNotes = new Set<string>(); // To prevent duplicates

  return scala.data.map((value) => {
    let bestBaseName = "";
    let minAbsSteps = Infinity;
    let bestSteps = 0;

    for (let i = 0; i < noteDegrees.length; i++) {
      const degree = noteDegrees[i];
      const baseName = noteNames[i];
      const refValue = (degree * modulo) / 12;
      const octaveOffset = Math.round((value - refValue) / modulo);
      const adjustedRefValue = refValue + octaveOffset * modulo;
      const diff = value - adjustedRefValue;
      const steps = diff / semitoneValue;
      const absSteps = Math.abs(steps);

      if (
        absSteps < minAbsSteps ||
        (absSteps === minAbsSteps && !usedNotes.has(baseName))
      ) {
        minAbsSteps = absSteps;
        bestBaseName = baseName;
        bestSteps = steps;
      }
    }

    usedNotes.add(bestBaseName);

    if (useCents) {
      const cents = Math.round(bestSteps * 100);
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

