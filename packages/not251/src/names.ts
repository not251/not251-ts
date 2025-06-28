import {positionVector } from "./positionVector";
import { intervalVector } from "./intervalVector"; // intervalVector is imported but not used
import { modulo } from "./utility";
import { minRotation} from "./distances";

const noteItaliane: string[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const noteInglesi: string[]= ["C", "D", "E", "F", "G", "A", "B"]; // noteInglesi is declared but not used

/**
 * Generates Italian note names for a given scale (positionVector).
 * It compares the input scale to C Major, finds the best rotation,
 * calculates differences, and assigns sharps (#) or flats (b) accordingly.
 * Assumes a 7-note scale and modulo 12 context for standard naming.
 *
 * @param scala The input scale as a positionVector.
 * @returns An array of strings representing the note names (e.g., "Do#", "Reb").
 */
export function scaleNames(scala: positionVector): string[] {
  // FIX: Add input validation for empty scale data
  if (!scala || !scala.data || scala.data.length === 0) {
    //console.warn("scaleNames: Input scale data is empty or invalid.");
    return [];
  }

  const cMaj = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);

  // Ensure scale lengths match for direct comparison (or adapt logic)
  if (scala.data.length !== cMaj.data.length) {
    //console.warn(`scaleNames: Input scale length (${scala.data.length}) does not match C Major length (${cMaj.data.length}). Results may be inaccurate.`);
    // Decide how to handle: return empty, throw error, or attempt partial naming?
    // For now, returning empty array.
    return [];
  }

  let rotation = minRotation(scala, cMaj);

  // Assuming both scales have the same length (checked above)
  const scaleLength = scala.data.length; // Use actual length

  const translated1 = cMaj.rototranslate(rotation, scaleLength, false);
  const translated2 = cMaj.rototranslate(rotation + 1, scaleLength, false);

  // FIX: Check if translated data arrays are valid
  if (!translated1.data || !translated2.data || translated1.data.length !== scaleLength || translated2.data.length !== scaleLength) {
      //console.error("scaleNames: Error during C Major rototranslation.");
      return [];
  }

  // FIX: Use nullish coalescing (?? 0) to handle potential undefined elements (TS2532)
  const diff1 = translated1.data.map((value, index) => (value ?? 0) - (scala.data[index] ?? 0));
  const diff2 = translated2.data.map((value, index) => (value ?? 0) - (scala.data[index] ?? 0));

  // FIX: Ensure reduce works correctly even if map produced undefined (though ?? 0 prevents that)
  const sumDiff1 = diff1.reduce((acc, val) => acc + (val ?? 0), 0);
  const sumDiff2 = diff2.reduce((acc, val) => acc + (val ?? 0), 0);

  let bestTranslated: positionVector;
  // Use absolute difference for comparison
  if (Math.abs(sumDiff1) <= Math.abs(sumDiff2)) {
    bestTranslated = translated1;
  } else {
    rotation = rotation + 1;
    bestTranslated = translated2;
  }

  // FIX: Check if bestTranslated.data is valid
  if (!bestTranslated.data || bestTranslated.data.length !== scaleLength) {
      //console.error("scaleNames: Error selecting best translated scale.");
      return [];
  }

  const names: string[] = [];

  for (let i = 0; i < scaleLength; i++) {
    // FIX: Use nullish coalescing (?? 0) for safe subtraction (TS2532)
    const diff = (scala.data[i] ?? 0) - (bestTranslated.data[i] ?? 0);

    // FIX: Check if the base name exists before using it (TS2345)
    const baseName = noteItaliane[modulo(rotation + i, noteItaliane.length)];
    if (baseName === undefined) {
        //console.warn(`scaleNames: Could not find base name for index ${modulo(rotation + i, noteItaliane.length)}`);
        names.push("N/A"); // Add a placeholder if name is not found
        continue;
    }

    let nome = baseName; // Now 'nome' is guaranteed to be a string

    // Corretto: Usa > invece di &gt;
    if (diff > 0) {
      // Corretto: Usa < invece di &lt;
      for (let j = 0; j < diff ; j++) {
        nome += "#";
      }
    // Corretto: Usa < invece di &lt;
    } else if (diff < 0) {
      // Corretto: Usa < invece di &lt;
      for (let j = 0; j < -diff; j++) {
        nome += "b";
      }
    }
    names.push(nome); // 'nome' is now definitely a string (TS2345 fix)
  }
  return names;
}
