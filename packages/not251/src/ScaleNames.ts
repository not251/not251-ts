// Import necessary types and functions
import { scaleNames as getNoteNameArray } from "./chord"; // Renamed import for clarity, assuming it's the correct source
import { positionVector } from "./positionVector";
import { modulo } from "./utility"; // Assuming modulo handles negative results correctly

// Define the structure for scale pool entries
export type ScalePoolEntry = {
  name: string;
  degrees: number[];
};

// Define the pool of reference scales
export const scalePool: ScalePoolEntry[] = [
  { name: "Lidia Dominate", degrees: [0, 2, 4, 6, 7, 9, 10] },
  { name: "Superlocria", degrees: [0, 1, 3, 4, 6, 8, 10] },
  { name: "Maggiore armonica", degrees: [0, 2, 4, 5, 7, 8, 11] },
  { name: "Minore armonica", degrees: [0, 2, 3, 5, 7, 8, 11] },
  { name: "Minore melodica", degrees: [0, 2, 3, 5, 7, 9, 11] },
  { name: "Locria", degrees: [0, 1, 3, 5, 6, 8, 10] },
  { name: "Minore naturale", degrees: [0, 2, 3, 5, 7, 8, 10] },
  { name: "Lidia", degrees: [0, 2, 4, 6, 7, 9, 11] },
  { name: "Frigia", degrees: [0, 1, 3, 5, 7, 8, 10] },
  { name: "Dorica", degrees: [0, 2, 3, 5, 7, 9, 10] },
  { name: "Maggiore", degrees: [0, 2, 4, 5, 7, 9, 11] },
  { name: "Misolidia", degrees: [0, 2, 4, 5, 7, 9, 10] },
  { name: "Esatonica", degrees: [0, 2, 4, 6, 8, 10] },
  { name: "Pentatonica Maggiore", degrees: [0, 2, 4, 7, 9] },
  { name: "Pentatonica Minore", degrees: [0, 3, 5, 7, 10] },
  { name: "Blues", degrees: [0, 3, 5, 6, 7, 10] },
];

// Type for combinations including null
type Combination<T> = (T | null)[];

/**
 * Generates combinations with null padding.
 * @template T
 * @param {T[]} arr - Input array.
 * @param {number} n - Desired length.
 * @returns {Combination<T>[]} Array of combinations.
 */
function generateCombinations<T>(arr: T[], n: number): Combination<T>[] {
  if (n < arr.length) {
    throw new Error("generateCombinations: n must be >= arr.length.");
  }
  // Handle empty input array case
  if (arr.length === 0 && n > 0) {
      return [Array(n).fill(null)];
  }
  if (arr.length === 0 && n === 0) {
      return [[]];
  }


  const m = arr.length;
  const combinations: Combination<T>[] = [];

  function backtrack(current: Combination<T>, index: number): void {
    if (current.length === n) {
      // Check if all elements from the original array 'arr' are present in 'current'
      const includesAll = arr.every((element) => current.includes(element));
      if (includesAll) {
        combinations.push([...current]);
      }
      return;
    }

    // Add element from arr
    if (index < m) {
      // Use non-null assertion assuming arr[index] exists within bounds
      // This is generally safe if the loop logic calling backtrack is correct.
      current.push(arr[index]!);
      backtrack(current, index + 1);
      current.pop();
    }

    // Add null (only if needed to reach length n and preserve elements)
    if (current.length < n) {
      const remainingSlots = n - current.length;
      const requiredElements = m - index; // Elements from arr not yet added/considered
      // Only add null if there are more remaining slots than required elements
      if (remainingSlots > requiredElements) {
        current.push(null);
        backtrack(current, index); // Index stays same for null
        current.pop();
      }
    }
  }

  backtrack([], 0);
  return combinations;
}

/**
 * Aligns two scales by matching degrees and minimizing distance for duplicates.
 * @param {positionVector} scaleA - First scale.
 * @param {positionVector} scaleB - Second scale.
 * @returns {[Combination<number>, Combination<number>]} Aligned scales.
 */
function alignScales(
  scaleA: positionVector,
  scaleB: positionVector
): [Combination<number>, Combination<number>] {
  // Check for empty data arrays
  if (scaleA.data.length === 0 || scaleB.data.length === 0) {
    // console.warn("alignScales: Input scale data is empty."); // Rimosso console.warn
    return [[], []];
  }

  // Assuming getDegrees() returns number[] as per positionVector.ts logic
  const degreesA = scaleA.getDegrees();
  const degreesB = scaleB.getDegrees();

  // Check if degrees arrays are valid
  if (!degreesA || !degreesB || degreesA.some(d => d === undefined) || degreesB.some(d => d === undefined)) {
    // console.error("alignScales: Could not get valid degrees."); // Rimosso console.error
    return [[], []];
  }
  // Ensure type safety after check
  const safeDegreesA = degreesA as number[];
  const safeDegreesB = degreesB as number[];


  // Simple equality check might be too strict, consider deep equality if needed
  if (JSON.stringify(safeDegreesA) === JSON.stringify(safeDegreesB)) {
    // Return copies with null possibility, handling potential undefined in data
    return [
        scaleA.data.map(d => d ?? null),
        scaleB.data.map(d => d ?? null)
    ];
  }

  // Safely access data[0] and handle potential undefined
  const shiftA = scaleA.data[0];
  const shiftB = scaleB.data[0];
  if (shiftA === undefined || shiftB === undefined) {
    // console.error("alignScales: Scale data[0] is undefined."); // Rimosso console.error
    return [[], []];
  }
  const shifting = shiftA - shiftB;
  const newB = scaleB.sum(shifting); // Assuming sum handles data correctly

  // Check newB.data after sum operation
  if (newB.data.length === 0) {
    // console.error("alignScales: newB data is empty after sum."); // Rimosso console.error
    return [[], []];
  }

  const maxLength = Math.max(scaleA.data.length, newB.data.length); // Use newB length
  const alignedA: Combination<number> = Array(maxLength).fill(null);
  const alignedB: Combination<number> = Array(maxLength).fill(null);

  let index = 0;
  let indexA = 0;
  let indexB = 0;

  // Ensure loop terminates and indices don't go out of bounds
  while (index < maxLength && indexA < safeDegreesA.length && indexB < safeDegreesB.length) {
    // Use non-null assertion assuming indices are valid within the loop
    const degA = safeDegreesA[indexA]!;
    const degB = safeDegreesB[indexB]!;
    const nextDegA = safeDegreesA[indexA + 1]; // Might be undefined
    const nextDegB = safeDegreesB[indexB + 1]; // Might be undefined

    // Handle undefined nextDegA/nextDegB in comparison
    const isLastA = (nextDegA === undefined || nextDegA !== degA);
    const isLastB = (nextDegB === undefined || nextDegB !== degB);

    if (degA === degB && isLastA && isLastB) {
      // Single match for this degree in both scales
      // Use ?? null for potential undefined from data access
      alignedA[index] = scaleA.data[indexA] ?? null;
      alignedB[index] = newB.data[indexB] ?? null;
      indexA++;
      indexB++;
      index++;
    } else if (degA === degB) {
      // Duplicate degrees match, need alignment
      let iA = 1;
      // Check bounds for indexA + iA
      while (indexA + iA < safeDegreesA.length && safeDegreesA[indexA + iA] === degA) {
        iA++;
      }

      let iB = 1;
      // Check bounds for indexB + iB
      while (indexB + iB < safeDegreesB.length && safeDegreesB[indexB + iB] === degB) {
        iB++;
      }

      let iC = Math.max(iA, iB);
      // Ensure slices don't go out of bounds and handle potential undefined
      const aTemp = scaleA.data.slice(indexA, indexA + iA).filter((v): v is number => v !== undefined);
      const bTemp = newB.data.slice(indexB, indexB + iB).filter((v): v is number => v !== undefined);

      let aResult: Combination<number> = Array(iC).fill(null);
      let bResult: Combination<number> = Array(iC).fill(null);

      if (iA > iB) {
        // a is longer, generate combinations for b
        aResult = aTemp.map(v => v ?? null); // Map to Combination<number>
        if (bTemp.length > 0) { // Only generate if bTemp is not empty
          const bComb = generateCombinations(bTemp, iC);
          let best = Infinity;
          let idxBest = -1; // Use -1 to indicate not found
          for (let i = 0; i < bComb.length; i++) {
            let dist = 0;
            // Check if bComb[i] exists
            const currentBComb = bComb[i];
            if (currentBComb) {
              for (let j = 0; j < currentBComb.length; j++) {
                // Check if elements exist and are not null or undefined
                const combVal = currentBComb[j];
                const aVal = aResult[j]; // Use aResult here
                // FIX: Changed !== null to != null (checks both null and undefined)
                if (combVal != null && aVal != null) {
                  dist += Math.abs(combVal - aVal);
                }
              }
              if (dist < best) {
                best = dist;
                idxBest = i;
              }
            }
          }
          // Use fallback if idxBest remains -1 or bComb[idxBest] is undefined
          bResult = idxBest !== -1 ? (bComb[idxBest] ?? Array(iC).fill(null)) : Array(iC).fill(null);
        } else {
          bResult = Array(iC).fill(null); // If bTemp was empty
        }
      } else {
        // b is longer or equal, generate combinations for a
        bResult = bTemp.map(v => v ?? null); // Map to Combination<number>
        if (aTemp.length > 0) { // Only generate if aTemp is not empty
          const aComb = generateCombinations(aTemp, iC);
          let best = Infinity;
          let idxBest = -1; // Use -1
          for (let i = 0; i < aComb.length; i++) {
            let dist = 0;
            // Check if aComb[i] exists
            const currentAComb = aComb[i];
            if (currentAComb) {
              for (let j = 0; j < currentAComb.length; j++) {
                // Check if elements exist and are not null or undefined
                const combVal = currentAComb[j];
                const bVal = bResult[j]; // Use bResult here
                // FIX: Changed !== null to != null (checks both null and undefined)
                if (combVal != null && bVal != null) {
                  dist += Math.abs(combVal - bVal);
                }
              }
              if (dist < best) {
                best = dist;
                idxBest = i;
              }
            }
          }
          // Use fallback if idxBest remains -1 or aComb[idxBest] is undefined
          aResult = idxBest !== -1 ? (aComb[idxBest] ?? Array(iC).fill(null)) : Array(iC).fill(null);
        } else {
          aResult = Array(iC).fill(null); // If aTemp was empty
        }
      }

      indexA += iA;
      indexB += iB;

      let c = 0;
      while (iC > 0 && index < maxLength) { // Add bounds check for index
        // Use ?? null for potential undefined from aResult[c]/bResult[c]
        alignedA[index] = aResult[c] ?? null;
        alignedB[index] = bResult[c] ?? null;
        c++;
        iC--;
        index++;
      }
    } else if (degA < degB) {
      // Degree in A is smaller, advance A
      // Use ?? null (TS2345 fix already present)
      alignedA[index] = scaleA.data[indexA] ?? null;
      indexA++;
      index++;
    } else { // degB < degA
      // Degree in B is smaller, advance B
      // Use ?? null (TS2345 fix already present)
      alignedB[index] = newB.data[indexB] ?? null;
      indexB++;
      index++;
    }
  }
  // Fill remaining slots if one scale finishes before the other
  while (index < maxLength && indexA < scaleA.data.length) {
    alignedA[index] = scaleA.data[indexA] ?? null;
    indexA++;
    index++;
  }
  while (index < maxLength && indexB < newB.data.length) {
    alignedB[index] = newB.data[indexB] ?? null;
    indexB++;
    index++;
  }

  // Remove the shift from B
  for (let i = 0; i < alignedB.length; i++) {
    const valB = alignedB[i];
    // FIX: Changed !== null to != null (checks both null and undefined)
    if (valB != null) {
      alignedB[i] = valB - shifting;
    }
  }

  return [alignedA, alignedB];
}

/**
 * Finds the name of a scale based on a predefined pool, including variations.
 * @param {positionVector} scaleInput - The input scale.
 * @returns {string} The name of the closest scale with variations.
 */
// FIX: Added export keyword (TS2459, TS2323, TS2484)
export function findScaleName(scaleInput: positionVector): string {
  // Check for empty input
  if (scaleInput.data.length === 0) return "N.C."; // No Chord or Not Classified

  // Safely get root note name using the imported function
  const rootNoteResult = getNoteNameArray(scaleInput); // Use renamed import
  // Handle potential empty array or undefined element
  const rootNote = rootNoteResult.length > 0 ? (rootNoteResult[0] ?? 'N') : 'N';

  // Normalize the input scale. Ensure toZero() handles empty data.
  const normalizedInput = scaleInput.toZero();
  // Check if normalization resulted in empty data
  if (normalizedInput.data.length === 0) {
      // console.warn("findScaleName: Normalization resulted in empty scale."); // Rimosso console.warn
      return `${rootNote} Unknown`;
  }

  // Prepare the pool of scales as positionVectors
  const pool = scalePool.map((s) => ({
    name: s.name,
    // Ensure positionVector constructor handles empty degrees array if needed
    degrees: new positionVector(s.degrees, 12, 12),
  }));

  let closestScaleName = "Unknown"; // Default name
  let minDistance = Infinity;
  let variationLabels: string[] = [];
  let bestBaseMatch = -Infinity; // Use -Infinity to ensure first valid match is chosen

  for (const poolScale of pool) {
    // Ensure poolScale.degrees is valid before aligning
    if (poolScale.degrees.data.length === 0) continue;

    const [alignedInput, alignedReference] = alignScales(normalizedInput, poolScale.degrees);

    // Check if alignment produced valid results (non-empty)
    if (alignedInput.length === 0) continue;

    let distance = 0;
    let baseMatch = 0;
    const alignmentLength = alignedInput.length; // Use consistent length

    for (let i = 0; i < alignmentLength; i++) {
      const inputDegree = alignedInput[i];
      const referenceDegree = alignedReference[i];

      // FIX: Changed !== null to != null (checks both null and undefined)
      if (inputDegree != null && referenceDegree != null) {
        // Check if it's a "base" degree index (0=root, 2=3rd, 4=5th, 6=7th approx) - this logic might need refinement
        // This assumes a 7-note scale context for base degrees.
        if ([0, 2, 4, 6].includes(i) && inputDegree === referenceDegree) {
          baseMatch++;
        }
        // No non-null assertion needed due to != null checks
        distance += Math.abs(inputDegree - referenceDegree);
      } else if (inputDegree != null || referenceDegree != null) { // Use != null here too
        // Penalize missing notes in either scale
        distance += 12; // Increased penalty for missing notes might be better
      }
    }

    // Update condition to prefer better base match first, then lower distance
    if (baseMatch > bestBaseMatch || (baseMatch === bestBaseMatch && distance < minDistance)) {
      bestBaseMatch = baseMatch;
      minDistance = distance;
      closestScaleName = poolScale.name;

      // --- Calculate Variations ---
      // Create a temporary vector with aligned degrees, filling nulls from reference
      const filledInputData: number[] = [];
      for (let i = 0; i < alignmentLength; i++) {
        const inputVal = alignedInput[i];
        const refVal = alignedReference[i];
        // Use reference value if input is null, ensure it's not null either
        if (inputVal != null) { // Use != null
          filledInputData.push(inputVal);
        } else if (refVal != null) { // Use != null
          // Only fill with reference if input is null
          filledInputData.push(refVal);
        }
        // If both are null, skip (shouldn't happen with current alignScales logic)
      }

      // Ensure filledInputData is not empty before creating vector
      if (filledInputData.length === 0) {
        // console.warn("findScaleName: filledInputData is empty during variation calculation."); // Rimosso console.warn
        variationLabels = ["Error"]; // Indicate error
        continue; // Skip variation calculation for this candidate
      }

      // Create positionVector from filled data, using original scale's modulo/span
      const filledInput = new positionVector(filledInputData, scaleInput.modulo, scaleInput.span);
      // filledInput.spanUpdate(); // Span update might not be necessary here

      const degrees = filledInput.getDegrees(); // Get degrees of the combined scale
      // Check if degrees is valid and matches length
      if (!degrees || degrees.length !== alignmentLength || degrees.some(d => d === undefined)) {
        // console.warn("findScaleName: Invalid degrees array obtained for variation calculation."); // Rimosso console.warn
        variationLabels = ["Error"];
        continue;
      }
      const safeDegrees = degrees as number[]; // Type assertion after check

      variationLabels = []; // Reset labels for this candidate
      const majorScaleRefValues = [0, 2, 4, 5, 7, 9, 11]; // Reference values for degree names (approx)

      for (let i = 0; i < alignmentLength; i++) {
        const inputDegree = alignedInput[i]; // number | null | undefined
        const referenceDegree = alignedReference[i]; // number | null | undefined
        // Use non-null assertion assuming safeDegrees[i] exists
        const degreeRefIndex = safeDegrees[i]!; // This is the functional degree index (0-6 approx)
        const degreeName = degreeRefIndex + 1; // 1-based degree name

        // Ensure degreeRefIndex is within bounds for majorScaleRefValues
        if (degreeRefIndex < 0 || degreeRefIndex >= majorScaleRefValues.length) {
          // console.warn(`Degree index ${degreeRefIndex} out of bounds for major scale reference.`);
          continue; // Skip this degree if index is invalid
        }
        // Use non-null assertion assuming majorScaleRefValues[degreeRefIndex] exists
        const majorScaleDegreeValue = majorScaleRefValues[degreeRefIndex]!;

        // FIX: Changed === null to == null and !== null to != null
        if (referenceDegree == null && inputDegree != null) {
          // Added note compared to reference scale
          // Calculate diff relative to standard major scale degree value
          const diff = modulo(inputDegree - majorScaleDegreeValue, 12); // Use modulo 12 for comparison
          if (diff === 1 || diff === -11) variationLabels.push(`add#${degreeName}`);
          else if (diff === 11 || diff === -1) variationLabels.push(`addb${degreeName}`);
          else if (diff !== 0) variationLabels.push(`add${degreeName}`); // Indicate added non-standard interval if diff != 0
        } else if (inputDegree == null && referenceDegree != null) {
          // Omitted note compared to reference scale
          variationLabels.push(`no${degreeName}`);
        } else if (inputDegree != null && referenceDegree != null && inputDegree !== referenceDegree) {
          // Altered note compared to reference scale
          // Calculate diff relative to the reference scale's degree value
          const diff = modulo(inputDegree - referenceDegree, 12); // Use modulo 12
          if (diff === 1 || diff === -11) variationLabels.push(`#${degreeName}`);
          else if (diff === 11 || diff === -1) variationLabels.push(`b${degreeName}`);
          // else: Difference is > 1 semitone, maybe indicate differently? (e.g., 'alt')
          else if (diff !== 0) variationLabels.push(`alt${degreeName}`);
        }
      }
    }
  }

  // Construct final name
  // Remove duplicates from variationLabels
  const uniqueVariationLabels = [...new Set(variationLabels)];
  const variationText = uniqueVariationLabels.length > 0 ? ` (${uniqueVariationLabels.join(", ")})` : "";
  // Ensure closestScaleName is assigned, provide fallback
  const finalScaleName = closestScaleName === "Unknown" && minDistance === Infinity ? "Unclassified" : closestScaleName;

  return `${rootNote} ${finalScaleName}${variationText}`;
}

// Export the main function
// FIX: Removed duplicate export statement (TS2323 / TS2484)
// export { findScaleName };
