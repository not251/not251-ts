import { toIntervals, toPositions } from "./crossOperation";
import { euclideanDistance } from "./distances";
import { intervalVector } from "./intervalVector";
import { positionVector, inverse_select } from "./positionVector";
import { autoModeGO, autoModeOptions, ScaleParams } from "./scale";
import { modulo } from "./utility";

/**
 * Counts the number of adjacent values in a circular scale.
 * Two values are considered adjacent if their difference (modulo the given modulo) is 1.
 * @param scale An array of numbers representing the scale
 * @param modulo The modulus for circular arithmetic
 * @returns The count of adjacent values in the scale
 */
function countAdjacentValues(scale: number[], modulo: number): number {
  let count = 0;
  let sortedScale = [...scale].sort((a, b) => a - b);
  for (let i = 0; i < sortedScale.length; i++) {
    let current = sortedScale[i];
    let next = sortedScale[(i + 1) % sortedScale.length];
    if ((next - current + modulo) % modulo === 1) {
      count++;
    }
  }
  return count;
}

/**
 * Automatically adjusts a scale to include given notes, optimizing for adjacency.
 * It can operate in left, right, or auto mode. In auto mode, it chooses the result with fewer adjacent values.
 * @param scale The original scale to be adjusted
 * @param notes The notes to be included in the scale
 * @param modulo The modulus for circular arithmetic
 * @param left Whether to prefer lower (left) or higher (right) values when quantizing
 * @param auto If true, compares left and right results and chooses the optimal one
 * @returns The adjusted scale
 */
function autoScale(
  scale: number[],
  notes: number[],
  modulo: number,
  left: boolean,
  auto: boolean
): number[] {
  if (auto) {
    let leftResult = tryAutoScale(scale, notes, modulo, true);
    let rightResult = tryAutoScale(scale, notes, modulo, false);

    let leftAdjacentCount = countAdjacentValues(leftResult, modulo);
    let rightAdjacentCount = countAdjacentValues(rightResult, modulo);

    if (leftAdjacentCount === rightAdjacentCount) {
      let result = tryAutoScale(scale, notes, modulo, left);
      return result;
    }

    return leftAdjacentCount < rightAdjacentCount ? leftResult : rightResult;
  } else {
    let result = tryAutoScale(scale, notes, modulo, left);
    return result;
  }
}

/**
 * Attempts to adjust the scale to include the given notes, preferring left or right quantization.
 * @param scale The original scale to be adjusted
 * @param notes The notes to be included in the scale
 * @param modulo The modulus for circular arithmetic
 * @param left Whether to prefer lower (left) or higher (right) values when quantizing
 * @returns The adjusted scale
 */
function tryAutoScale(
  scale: number[],
  notes: number[],
  modulo: number,
  left: boolean
): number[] {
  let updatedScale = [...scale];
  for (let note of notes) {
    let notePC = note % modulo;
    if (!updatedScale.includes(notePC)) {
      let closest = findClosestIndex(updatedScale, notePC, notes, left);
      if (closest === -1) {
        left = !left;
        closest = findClosestIndex(updatedScale, notePC, notes, left);
      }
      if (closest !== -1) {
        updatedScale[closest] = notePC;
      }
    }
  }
  return updatedScale;
}

/**
 * Quantizes a note to the nearest value in the scale, preferring lower or higher values.
 * @param note The note to be quantized
 * @param scale The scale to quantize against
 * @param left Whether to prefer lower (left) or higher (right) values
 * @returns The quantized note value
 */
function quantize(note: number, scale: number[], left: boolean): number {
  let lower = -1;
  let upper = -1;
  for (let i = 0; i < scale.length; i++) {
    if (scale[i] <= note) {
      lower = scale[i];
    }
    if (scale[i] >= note) {
      upper = scale[i];
      break;
    }
  }
  if (lower === -1) return upper;
  if (upper === -1) return lower;

  return left ? lower : upper;
}

/**
 * Finds the index of the closest value in the scale to the target, excluding certain values.
 * @param scale The scale to search in
 * @param target The target value to find the closest to
 * @param exclude An array of values to exclude from consideration
 * @param left Whether to prefer lower (left) or higher (right) values
 * @returns The index of the closest value, or -1 if not found
 */
function findClosestIndex(
  scale: number[],
  target: number,
  exclude: number[],
  left: boolean
): number {
  let quantizedValue = quantize(target, scale, left);
  let index = scale.indexOf(quantizedValue);
  if (index !== -1 && !exclude.includes(scale[index])) {
    return index;
  }

  return -1;
}

/**
 * Main function to demonstrate the usage of the autoScale function.
 * It sets up an initial scale, notes to include, and parameters, then calls autoScale and logs the result.
 */

/*

TEST!


function main() {
  let scale = [0, 2, 4, 5, 7, 9, 11];
  let notes = [3, 8];
  let modulo = 12;
  let left = false;
  let auto = true;

  let updatedScale = autoScale(scale, notes, modulo, left, auto);

  console.log("Updated scale:", updatedScale.join(" "));
}
*/

/**
 * Adjusts a scale to include a target note, ensuring chord degrees are preserved.
 *
 * If the target note is already in the scale, no changes are made. If not, the function identifies
 * the closest degrees in the scale and modifies the closest modifiable one, ensuring that
 * blocked degrees (representing chord tones) remain intact. If no degrees can be modified,
 * the target note is added to the scale.
 *
 * @param scale - The positionVector representing the scale to modify.
 * @param chordDegrees - The positionVector representing the chord degrees to preserve.
 * @param targetNote - The target note to include in the scale.
 * @returns An object containing the updated scale and updated chord degrees.
 */
function adaptScaleToNote(
  scale: positionVector,
  chordDegrees: positionVector,
  targetNote: number
) {
  // Check if the target note is already in the scale
  if (scale.isNote(targetNote)) {
    return {
      updatedScale: new positionVector(
        [...scale.data],
        scale.modulo,
        scale.span
      ),
      updatedDegrees: new positionVector(
        [...chordDegrees.data],
        chordDegrees.modulo,
        chordDegrees.span
      ),
    };
  }

  // Identify the blocked degrees from the chord
  const blockedDegrees = new Set(
    chordDegrees.data.map((degree) => modulo(degree, scale.data.length))
  );

  // Calculate the target note in the scale's modulo
  let targetMod = modulo(targetNote, scale.modulo);
  while (targetMod < scale.data[0]) {
    targetMod += scale.modulo;
  }

  // Find the two closest degrees in the scale
  let lowerIndex = -1;
  let upperIndex = -1;

  for (let i = 0; i < scale.data.length; i++) {
    if (scale.data[i] < targetMod) lowerIndex = i;
    if (scale.data[i] > targetMod && upperIndex === -1) {
      upperIndex = i;
      break;
    }
  }

  const possibleIndexes = [];
  if (lowerIndex !== -1) possibleIndexes.push(lowerIndex); // Degree immediately below
  if (upperIndex !== -1) possibleIndexes.push(upperIndex); // Degree immediately above

  // Remove blocked degrees from the list of possible modifications
  const modifiableIndexes = possibleIndexes.filter(
    (index) => !blockedDegrees.has(index)
  );

  const updatedScaleData = [...scale.data];
  if (modifiableIndexes.length > 0) {
    // Modify the first modifiable degree
    const indexToModify = modifiableIndexes[0];
    updatedScaleData[indexToModify] = targetMod;
  } else {
    // Add the target note if no degrees can be modified
    updatedScaleData.push(targetMod);
  }
  updatedScaleData.sort((a, b) => a - b);
  // Remove duplicates and sort the updated scale
  const uniqueSortedScale = Array.from(new Set(updatedScaleData));

  // Update the chord degrees in the new scale
  const updatedScale = new positionVector(
    uniqueSortedScale,
    scale.modulo,
    scale.span
  );
  const updatedDegrees = inverse_select(
    scale.selectFromPosition(chordDegrees),
    updatedScale
  );
  return {
    updatedScale,
    updatedDegrees,
  };
}

function adaptScale(
  inputScaleParams: ScaleParams,
  notes: positionVector
): ScaleParams {
  if (!inputScaleParams.intervals) {
    throw new Error("Intervals in inputScaleParams are undefined.");
  }

  let result = adaptScale_internal(
    new intervalVector(
      [...inputScaleParams.intervals.data],
      inputScaleParams.intervals.modulo,
      inputScaleParams.intervals.offset
    ),
    new positionVector([...notes.data], notes.modulo, notes.span)
  );

  let outputScaleParams = { ...inputScaleParams };
  outputScaleParams.modo = result.rotation;
  outputScaleParams.intervals = result.data;
  return outputScaleParams;
}

/**
 * Adapts a given scale (intervalVector) to match a set of notes (positionVector).
 *
 * The function generates all possible modes of the input scale and identifies
 * the modes with the highest number of matching notes. If multiple modes have
 * the same number of matches, the function adapts each of them to include all
 * notes and selects the most similar one to the original scale based on
 * Euclidean distance.
 *
 * @param scaleIntervals - The input scale represented as an intervalVector.
 * @param notes - The notes to match, represented as a positionVector.
 * @returns An object containing:
 *   - `data`: The adapted scale as an intervalVector.
 *   - `rotation`: The rotation index of the chosen mode.
 */
function adaptScale_internal(
  scaleIntervals: intervalVector,
  notes: positionVector
): { rotation: number; data: intervalVector } {
  // Generate all modes
  let modes = autoModeGO(scaleIntervals);

  // Get all options sorted by match count
  let options = autoModeOptions(modes, notes, true) as {
    rotation: number;
    data: number[];
    matchedIndices: number[];
    matchCount: number;
  }[];

  // Find the maximum match count
  const maxMatchCount = options[0].matchCount;

  // Filter options with the maximum match count
  const bestOptions = options.filter(
    (option) => option.matchCount === maxMatchCount
  );

  let bestAdaptedScale: positionVector | null = null;
  let minDistance = Infinity;
  let finalRotation = -1;

  for (const best of bestOptions) {
    let matched = [...best.matchedIndices];
    let bestOption: positionVector = new positionVector(
      best.data,
      scaleIntervals.modulo,
      scaleIntervals.modulo
    );

    let blocked = notes.selectFromPosition(
      new positionVector(matched, bestOption.modulo, bestOption.span)
    );

    let blockedDeg = inverse_select(blocked, bestOption);

    // Process remaining notes
    for (let i = 0; i < notes.data.length; i++) {
      if (!matched.includes(i)) {
        // Adapt the scale to include the current note
        let adaptationResult = adaptScaleToNote(
          bestOption,
          blockedDeg,
          notes.data[i]
        );

        bestOption = adaptationResult.updatedScale;

        // Update matched notes
        matched.push(i);
        matched.sort((a: number, b: number) => a - b);

        // Recompute blocked positions and degrees
        blocked = notes.selectFromPosition(
          new positionVector(matched, bestOption.modulo, bestOption.span)
        );
        blockedDeg = inverse_select(blocked, bestOption);
      }
    }

    // Calculate the distance between the original scale and the adapted scale
    const originalScale = toPositions(scaleIntervals);
    const distance = euclideanDistance(originalScale.data, bestOption.data);

    // Keep track of the best adapted scale with minimum distance
    if (distance < minDistance) {
      minDistance = distance;
      bestAdaptedScale = bestOption;
      finalRotation = best.rotation;
    }
  }

  if (!bestAdaptedScale) {
    throw new Error("No adapted scale found.");
  }

  // Convert the best adapted scale to intervals
  const out = toIntervals(bestAdaptedScale);

  return {
    data: out,
    rotation: finalRotation,
  };
}
