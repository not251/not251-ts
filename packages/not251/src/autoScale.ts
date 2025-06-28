import { toIntervals, toPositions } from "./crossOperation";
import { euclideanDistance } from "./distances";
import { intervalVector } from "./intervalVector";
import { positionVector, inverse_select } from "./positionVector";
import { autoModeGO, autoModeOptions, ScaleParams } from "./scale"; // Rimosso .js
import { modulo } from "./utility";
import { quantize as quantizeNote } from "./quantize"; // Importata da quantize.ts

/**
 * Counts the number of adjacent values in a circular scale.
 * Two values are considered adjacent if their difference (modulo the given modulo) is 1.
 * @param scale An array of numbers representing the scale
 * @param moduloo The modulus for circular arithmetic (rinominato per evitare conflitto con la funzione modulo importata)
 * @returns The count of adjacent values in the scale
 */
function countAdjacentValues(scale: number[], moduloo: number): number {
  let count = 0;
  // Create a sorted copy to avoid modifying the original array
  let sortedScale = [...scale].sort((a, b) => a - b);
  for (let i = 0; i < sortedScale.length; i++) {
    let current = sortedScale[i];
    // Use modulo length for the next index to wrap around correctly
    let next = sortedScale[(i + 1) % sortedScale.length];
    // FIX: Check if current and next are numbers before using modulo (TS18048)
    if (current != null && next != null) {
      // Calculate the difference correctly in a circular manner
      if ( modulo(next - current, moduloo) === 1) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Automatically adjusts a scale (represented by an array of numbers) to include given notes, optimizing for adjacency.
 * It can operate in left, right, or auto mode. In auto mode, it chooses the result with fewer adjacent values.
 * Note: This function operates on simple number arrays, not positionVectors directly.
 * @param scale The original scale (array of numbers) to be adjusted
 * @param notes The notes (array of numbers) to be included in the scale
 * @param moduloo The modulus for circular arithmetic (rinominato per evitare conflitto)
 * @param left Whether to prefer lower (left) or higher (right) values when quantizing
 * @param auto If true, compares left and right results and chooses the optimal one based on adjacency count.
 * @returns The adjusted scale (array of numbers)
 */
function autoScaleSimple(
  scale: number[],
  notes: number[],
  moduloo: number, // Rinominato
  left: boolean,
  auto: boolean
): number[] {
  if (auto) {
    let leftResult = tryAutoScale(scale, notes, moduloo, true);
    let rightResult = tryAutoScale(scale, notes, moduloo, false);

    let leftAdjacentCount = countAdjacentValues(leftResult, moduloo);
    let rightAdjacentCount = countAdjacentValues(rightResult, moduloo);

    // If counts are equal, respect the initial 'left' preference
    if (leftAdjacentCount === rightAdjacentCount) {
      return tryAutoScale(scale, notes, moduloo, left);
    }
    // Otherwise, return the result with fewer adjacent values
    return leftAdjacentCount < rightAdjacentCount ? leftResult : rightResult;
  } else {
    // If not in auto mode, just perform the operation with the specified 'left' preference
    return tryAutoScale(scale, notes, moduloo, left);
  }
}

/**
 * Attempts to adjust the scale (array of numbers) to include the given notes, preferring left or right quantization.
 * Helper function for autoScaleSimple.
 * @param scale The original scale (array of numbers) to be adjusted
 * @param notes The notes (array of numbers) to be included in the scale
 * @param moduloo The modulus for circular arithmetic (rinominato per evitare conflitto)
 * @param left Whether to prefer lower (left) or higher (right) values when quantizing
 * @returns The adjusted scale (array of numbers)
 */
function tryAutoScale(
  scale: number[],
  notes: number[],
  moduloo: number, // Rinominato
  left: boolean
): number[] {
  let updatedScale = [...scale]; // Work on a copy
  let notesPC = notes.map(note => modulo(note, moduloo)); // Consider only pitch classes for exclusion check

  for (let note of notes) {
    let notePC = modulo(note, moduloo);
    // FIX: Replaced !updatedScale.includes(notePC) with updatedScale.indexOf(notePC) === -1
    if (updatedScale.indexOf(notePC) === -1) {
      // Try finding the closest index with the current 'left' preference
      let closest = findClosestIndex(updatedScale, notePC, notesPC, left);

      // If no suitable index found, try flipping the 'left' preference
      if (closest === -1) {
        closest = findClosestIndex(updatedScale, notePC, notesPC, !left);
      }

      // If a suitable index is found, update the scale
      if (closest !== -1) {
        updatedScale[closest] = notePC;
      }
      // If still no index found (e.g., all scale notes are in 'notesPC'), the note cannot be added by replacement.
      // This implementation doesn't add new notes, only replaces existing ones.
    }
  }
  // Ensure the scale remains sorted
  updatedScale.sort((a, b) => a - b);
  return updatedScale;
}


/**
 * Finds the index of the closest value in the scale to the target, excluding certain values.
 * Helper function for tryAutoScale.
 * @param scale The scale (array of numbers) to search in
 * @param target The target pitch class value to find the closest to
 * @param exclude An array of pitch class values to exclude from consideration for replacement
 * @param left Whether to prefer lower (left) or higher (right) values during quantization
 * @returns The index of the closest value eligible for replacement, or -1 if not found
 */
function findClosestIndex(
  scale: number[],
  target: number,
  exclude: number[],
  left: boolean
): number {
  // Quantize the target note to find a potential candidate in the scale
  let quantizedValue = quantizeNote(target, scale, left); // Use imported quantizeNote

  // Find the index of this quantized value
  let index = scale.indexOf(quantizedValue);
  let scaleValueAtIndex = scale[index]; // Potentially undefined

  // Check if the found index is valid and the note at that index is not in the exclusion list
  // FIX: Added check for scaleValueAtIndex != null (TS2345)
  if (index !== -1 && scaleValueAtIndex != null && exclude.indexOf(scaleValueAtIndex) === -1) {
    return index; // Return the index if it's a valid replacement target
  }

  // If the quantized value itself is excluded or not found, try the other direction
  quantizedValue = quantizeNote(target, scale, !left);
  index = scale.indexOf(quantizedValue);
  scaleValueAtIndex = scale[index]; // Potentially undefined

  // FIX: Added check for scaleValueAtIndex != null (TS2345)
  if (index !== -1 && scaleValueAtIndex != null && exclude.indexOf(scaleValueAtIndex) === -1) {
      return index; // Return the index if it's a valid replacement target
  }


  // If no suitable index is found in either direction
  return -1;
}


// --- Main Scale Adaptation Logic using positionVector ---

/**
 * Adjusts a scale (positionVector) to include a target note, ensuring chord degrees are preserved.
 *
 * If the target note is already in the scale, no changes are made. If not, the function identifies
 * the closest degrees in the scale and modifies the closest modifiable one (not part of chordDegrees),
 * ensuring that blocked degrees (representing chord tones) remain intact. If no degrees can be modified,
 * the target note is added to the scale.
 *
 * @param scale - The positionVector representing the scale to modify.
 * @param chordDegrees - The positionVector representing the *indices* of the chord degrees within the scale to preserve.
 * @param targetNote - The target note value to include in the scale.
 * @returns An object containing the updated scale and updated chord degree indices.
 */
function adaptScaleToNote(
  scale: positionVector,
  chordDegrees: positionVector, // These are indices in the scale.data array
  targetNote: number
): { updatedScale: positionVector; updatedDegrees: positionVector } {

  const originalScaleData = [...scale.data]; // Keep original for reference if needed
  const originalChordDegreeIndices = [...chordDegrees.data]; // Keep original for reference

  // Check if the target note's pitch class is already in the scale
  if (scale.isNote(targetNote)) {
    return {
      updatedScale: new positionVector([...scale.data], scale.modulo, scale.span),
      updatedDegrees: new positionVector([...chordDegrees.data], chordDegrees.modulo, chordDegrees.span),
    };
  }

  // Identify the blocked degree *indices* from the chordDegrees positionVector
  const blockedDegreeIndices = new Set(
    chordDegrees.data.map((degreeIndex) => degreeIndex != null ? modulo(degreeIndex, scale.data.length) : -1).filter(idx => idx !== -1) // FIX: Check for null and filter
  );

  // Calculate the target note's value within the scale's primary octave range for comparison
  let targetMod = modulo(targetNote, scale.modulo);
  const scaleData0 = scale.data[0]; // Potentially undefined

  // FIX: Check if scaleData0 is defined before using modulo (TS2345)
  const scaleData0Mod = scaleData0 != null ? modulo(scaleData0, scale.modulo) : 0; // Fallback to 0

  // Adjust targetMod to be within the octave starting from scale.data[0] if necessary
   while (targetMod < scaleData0Mod) {
       targetMod += scale.modulo;
   }
   while (targetMod >= scaleData0Mod + scale.modulo) {
       targetMod -= scale.modulo;
   }
   // Further adjustment might be needed if scale spans more than one modulo, find closest representation
    let closestTargetRepresentation = targetMod;
    let minDiff = Infinity;
    for(let oct = -1; oct <= 1; oct++){
        let currentRep = targetMod + oct * scale.modulo;
        // Compare to middle note or average note for better stability
        let avgScaleNote = scale.data.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) / scale.data.length; // FIX: Handle potential undefined in reduce
        let diff = Math.abs(currentRep - avgScaleNote);
        if(diff < minDiff){
            minDiff = diff;
            closestTargetRepresentation = currentRep;
        }
    }
    targetMod = closestTargetRepresentation;


  // Find the indices of the two closest notes in the scale data
  let lowerIndex = -1;
  let upperIndex = -1;
  let lowerDiff = Infinity;
  let upperDiff = Infinity;


  for (let i = 0; i < scale.data.length; i++) {
      const scaleNote = scale.data[i]; // Potentially undefined
      // FIX: Check if scaleNote is defined before using (TS2532)
      if (scaleNote != null) {
          const diff = targetMod - scaleNote;
          if (diff > 0 && diff < lowerDiff) {
              lowerDiff = diff;
              lowerIndex = i;
          }
          // Use <= 0 for upper index to handle exact matches correctly if needed elsewhere, though isNote should catch it
          if (diff <= 0 && Math.abs(diff) < upperDiff) {
              upperDiff = Math.abs(diff);
              upperIndex = i;
          }
      }
  }
   // Handle wrap-around case for lowerIndex more robustly
   if (lowerIndex === -1 && scale.data.length > 0) {
       const lastIndex = scale.data.length - 1;
       const lastScaleNote = scale.data[lastIndex]; // Potentially undefined
       // FIX: Check lastScaleNote (TS2532)
       if (lastScaleNote != null && targetMod > lastScaleNote) {
           lowerIndex = lastIndex;
           lowerDiff = targetMod - lastScaleNote; // Recalculate diff
       } else if (upperIndex !== -1) { // If target is not above last, check wrap-around from upper
           const wrapAroundIndex = modulo(upperIndex - 1, scale.data.length);
           const wrapAroundNote = scale.data[wrapAroundIndex]; // Potentially undefined
           // FIX: Check wrapAroundNote (TS2532)
           if (wrapAroundNote != null && targetMod > wrapAroundNote) {
               lowerIndex = wrapAroundIndex;
               lowerDiff = targetMod - wrapAroundNote;
           }
       }
   }
    // Handle wrap-around case for upperIndex more robustly
   if (upperIndex === -1 && scale.data.length > 0) {
       const firstIndex = 0;
       const firstScaleNote = scale.data[firstIndex]; // Potentially undefined
       // FIX: Check firstScaleNote (TS2532)
       if (firstScaleNote != null && targetMod < firstScaleNote) {
           upperIndex = firstIndex;
           upperDiff = firstScaleNote - targetMod; // Recalculate diff
       } else if (lowerIndex !== -1) { // If target is not below first, check wrap-around from lower
           const wrapAroundIndex = modulo(lowerIndex + 1, scale.data.length);
           const wrapAroundNote = scale.data[wrapAroundIndex]; // Potentially undefined
           // FIX: Check wrapAroundNote (TS2532)
            if (wrapAroundNote != null && targetMod < wrapAroundNote) {
               upperIndex = wrapAroundIndex;
               upperDiff = wrapAroundNote - targetMod;
           }
       }
   }


  const possibleIndexesToModify = [];
  if (lowerIndex !== -1) possibleIndexesToModify.push(lowerIndex);
  if (upperIndex !== -1 && upperIndex !== lowerIndex) possibleIndexesToModify.push(upperIndex); // Avoid duplicate if target matches a note

  // Filter out the blocked indices
  const modifiableIndexes = possibleIndexesToModify.filter(
    (index) => !blockedDegreeIndices.has(index)
  );

  const updatedScaleData = [...scale.data];

  if (modifiableIndexes.length > 0) {
    // Choose the closest modifiable index to modify
    let indexToModify: number;
    if (modifiableIndexes.length === 1) {
      // FIX: Check if modifiableIndexes[0] is defined (TS2532)
      indexToModify = modifiableIndexes[0] ?? -1; // Use fallback -1
    } else {
      // Both lower and upper are modifiable, choose the closer one based on diff
      // Ensure we are comparing the correct indices if modifiableIndexes order is [upper, lower]
      // FIX: Check if modifiableIndexes[0] and [1] are defined (TS2532)
      const idx1 = modifiableIndexes[0] ?? -1;
      const idx2 = modifiableIndexes[1] ?? -1;
      const diff1 = (idx1 === lowerIndex) ? lowerDiff : upperDiff;
      const diff2 = (idx2 === lowerIndex) ? lowerDiff : upperDiff;
      indexToModify = diff1 <= diff2 ? idx1 : idx2;
    }
    // Modify the scale data only if indexToModify is valid
    // FIX: Check indexToModify and ensure updatedScaleData[indexToModify] exists (TS2532)
    if (indexToModify !== -1 && indexToModify < updatedScaleData.length) {
        updatedScaleData[indexToModify] = targetMod;
    } else {
        // If indexToModify is invalid, add the note instead
        updatedScaleData.push(targetMod);
    }

  } else {
    // If no degrees can be modified, add the target note to the scale
    updatedScaleData.push(targetMod);
  }

  // Sort the updated scale data
  updatedScaleData.sort((a, b) => (a ?? 0) - (b ?? 0)); // FIX: Handle potential undefined in sort

  // Remove duplicates that might arise from modification/addition
  const uniqueSortedScaleData = Array.from(new Set(updatedScaleData.filter((v): v is number => v != null))); // FIX: Filter null/undefined before Set

  // Create the updated scale positionVector
  const updatedScale = new positionVector(
    uniqueSortedScaleData,
    scale.modulo,
    scale.span // Span will be updated below
  );
  updatedScale.spanUpdate(); // Recalculate span based on new data

  // --- Update Chord Degree Indices ---
  // We need to find the new indices in `updatedScale` that correspond
  // to the *original notes* represented by `originalChordDegreeIndices` in the `originalScaleData`.

  const originalChordNotes = originalScaleData.filter((_, index) =>
      // FIX: Replaced originalChordDegreeIndices.includes(index) with originalChordDegreeIndices.indexOf(index) !== -1
      originalChordDegreeIndices.indexOf(index) !== -1
  );

  // Find the indices of these original chord notes within the new `updatedScale.data`
  const updatedDegreeIndices: number[] = [];
  for (const note of originalChordNotes) {
      // FIX: Check if note is defined before using indexOf (TS2322)
      if (note != null) {
          const newIndex = updatedScale.data.indexOf(note);
          if (newIndex !== -1) {
              updatedDegreeIndices.push(newIndex);
          } else {
              // This case should ideally not happen if chord degrees were truly blocked,
              // but handle potential floating point issues or edge cases.
              // Find the closest note in the new scale as a fallback.
              let closestNewIndex = -1; // Initialize to -1
              let minNoteDiff = Infinity;
              for(let i = 0; i < updatedScale.data.length; i++) {
                  const updatedNote = updatedScale.data[i]; // Potentially undefined
                  // FIX: Check if updatedNote is defined (TS2322)
                  if (updatedNote != null) {
                      // Consider distance in pitch class space as well or primarily?
                      // let diff = Math.abs(modulo(updatedNote - note, scale.modulo));
                      // Using absolute difference for now
                      const diff = Math.abs(updatedNote - note);
                      if (diff < minNoteDiff) {
                          minNoteDiff = diff;
                          closestNewIndex = i;
                      }
                  }
              }
               // FIX: Replaced !updatedDegreeIndices.includes(closestNewIndex) with updatedDegreeIndices.indexOf(closestNewIndex) === -1
               if (closestNewIndex !== -1 && updatedDegreeIndices.indexOf(closestNewIndex) === -1) { // Avoid duplicate indices and ensure one was found
                   updatedDegreeIndices.push(closestNewIndex);
               }
              // console.warn(`Original chord note ${note} (index in original: ${originalScaleData.indexOf(note)}) not found exactly in updated scale. Using closest index ${closestNewIndex} (note: ${updatedScale.data[closestNewIndex]}).`); // Rimosso console.warn
          }
      }
  }
   updatedDegreeIndices.sort((a, b) => a - b); // Keep indices sorted


  const updatedDegrees = new positionVector(
      updatedDegreeIndices,
      updatedScale.data.length, // Modulo is now the new length
      updatedScale.data.length  // Span is also the new length
  );


  return {
    updatedScale,
    updatedDegrees,
  };
}

/**
 * Adapts the scale defined by inputScaleParams to best fit the provided notes.
 * It finds the best mode(s) of the original scale, adapts them to include all notes
 * while preserving essential chord tones derived from the notes themselves,
 * and selects the adapted scale most similar to the original.
 *
 * @param inputScaleParams - Parameters defining the initial scale (intervals, modulo, offset).
 * @param notes - The positionVector of notes the scale should be adapted to fit.
 * @returns Updated ScaleParams with potentially modified intervals and modo.
 */
export function adaptScale(
  inputScaleParams: ScaleParams,
  notes: positionVector
): ScaleParams {
  if (!inputScaleParams.intervals) {
    throw new Error("Intervals in inputScaleParams are undefined.");
  }

  // Create copies to avoid modifying originals directly
  const initialIntervals = new intervalVector(
    [...inputScaleParams.intervals.data],
    inputScaleParams.intervals.modulo,
    inputScaleParams.intervals.offset ?? inputScaleParams.root ?? 0 // Use offset or root from params or default to 0
  );
  const targetNotes = new positionVector(
    [...notes.data],
    notes.modulo,
    notes.span
  );

  // Call the internal adaptation logic
  let result = adaptScale_internal(initialIntervals, targetNotes);

  // Create output params based on input, then update
  let outputScaleParams = { ...inputScaleParams };
  outputScaleParams.modo = result.rotation;
  outputScaleParams.intervals = result.data; // result.data is the adapted intervalVector

  // Optional: Update root to match the offset of the adapted intervals
  outputScaleParams.root = result.data.offset;

  return outputScaleParams;
}

/**
 * Internal logic for adapting a scale (intervalVector) to match a set of notes (positionVector).
 *
 * Generates modes, finds best initial matches, adapts candidates to include all notes
 * while preserving chord tones implied by the notes, and selects the most similar result.
 *
 * @param scaleIntervals - The input scale represented as an intervalVector.
 * @param notes - The notes to match, represented as a positionVector.
 * @returns An object containing the adapted scale as an intervalVector and the rotation index.
 */
function adaptScale_internal(
  scaleIntervals: intervalVector,
  notes: positionVector
): { rotation: number; data: intervalVector } {

  // 1. Generate all modes of the initial scale
  let modes = autoModeGO(scaleIntervals);

  // 2. Find modes that best match the input notes (sorted by match count)
  // Ensure the type assertion matches the actual return type of autoModeOptions when findBest is true
  let options = autoModeOptions(modes, notes, true) as {
    rotation: number;
    data: number[]; // Note: This is position data from toPositions(rotated_intervals)
    matchedIndices: number[]; // Indices within the input 'notes' array
    matchCount: number;
  }[];

  // 3. Identify the highest match count achieved
  // FIX: Use optional chaining (?.) and nullish coalescing (??) to safely access options[0]
  const maxMatchCount = options[0]?.matchCount ?? 0;

  // If no notes match any mode, return the original scale's 0th rotation
   if (maxMatchCount === 0 && options.length > 0) {
       // console.warn("No notes matched any mode of the scale. Returning original scale (0th rotation)."); // Rimosso console.warn
       return { rotation: 0, data: scaleIntervals };
   }
    if (options.length === 0) {
         // This case should ideally not happen if autoModeGO works, but handle defensively
         // console.error("Could not generate modes or options for the scale. Returning original scale."); // Rimosso console.error
         return { rotation: 0, data: scaleIntervals };
    }


  // 4. Filter options to keep only those with the maximum match count
  const bestOptions = options.filter(
    (option) => option.matchCount === maxMatchCount
  );

  let bestAdaptedScale: positionVector | null = null;
  let minDistance = Infinity;
  let finalRotation = -1;

  const originalScalePositions = toPositions(scaleIntervals); // For distance comparison later

  // 5. Iterate through the best initial mode candidates
  for (const best of bestOptions) {
    let currentMatchedNoteIndices = [...best.matchedIndices]; // Indices in the 'notes' array
    // The scale data for this specific mode candidate
    let currentModeScale = new positionVector(
      [...best.data], // Use a copy
      scaleIntervals.modulo,
      scaleIntervals.modulo // Initial span assumption for modes
    );
     currentModeScale.spanUpdate(); // Ensure span is correct


    // Identify the notes that are already matched in this mode
    let matchedNotesVector = notes.selectFromPosition(
      new positionVector(currentMatchedNoteIndices, notes.data.length, notes.data.length)
    );

    // Determine the indices *within the currentModeScale* that correspond to these matched notes.
    // These are the degrees/notes we want to preserve (block from modification).
    let blockedScaleIndicesVector = inverse_select(matchedNotesVector, currentModeScale);


    // 6. Adapt the current mode to include the remaining notes
    for (let i = 0; i < notes.data.length; i++) {
      // If this note index wasn't part of the initial match for this mode
      // FIX: Replaced !currentMatchedNoteIndices.includes(i) with currentMatchedNoteIndices.indexOf(i) === -1
      if (currentMatchedNoteIndices.indexOf(i) === -1) {
        // Adapt the scale to include this specific note (notes.data[i])
        // FIX: Check if notes.data[i] is defined before passing (TS2345)
        const targetNote = notes.data[i];
        if (targetNote != null) {
            let adaptationResult = adaptScaleToNote(
              currentModeScale,
              blockedScaleIndicesVector, // Pass the indices within the scale to block
              targetNote
            );

            // Update the scale and the blocked indices for the next iteration
            currentModeScale = adaptationResult.updatedScale;
            blockedScaleIndicesVector = adaptationResult.updatedDegrees;

            // Add the newly included note's index to the list of matched indices
            currentMatchedNoteIndices.push(i);
            // No need to sort here if only checking for inclusion, but sorting doesn't hurt
            // currentMatchedNoteIndices.sort((a, b) => a - b);

             // Re-calculate matchedNotesVector based on updated indices (optional, only if needed later)
             // matchedNotesVector = notes.selectFromPosition(
             //    new positionVector(currentMatchedNoteIndices, notes.data.length, notes.data.length)
             // );
        }
      }
    }

    // 7. Calculate similarity (distance) between the fully adapted scale and the original scale
    // Compare position vectors normalized to start at 0 for structural comparison.
    const adaptedScaleNormalized = currentModeScale.toZero();
    const originalScaleNormalized = originalScalePositions.toZero();

    // Using Euclidean distance. Consider alternatives if scale length changes significantly.
    let distance: number;
     if (originalScaleNormalized.data.length === adaptedScaleNormalized.data.length) {
         // FIX: Filter undefined before passing to euclideanDistance
         const originalData = originalScaleNormalized.data.filter((v): v is number => v != null);
         const adaptedData = adaptedScaleNormalized.data.filter((v): v is number => v != null);
         // Check if lengths still match after filtering undefined
         if (originalData.length === adaptedData.length) {
             distance = euclideanDistance(originalData, adaptedData);
         } else {
             // Lengths differ after filtering undefined, handle as mismatch
             // console.warn(`Scale length changed after filtering undefined. Original: ${originalData.length}, Adapted: ${adaptedData.length}.`); // Rimosso console.warn
             const commonLength = Math.min(originalData.length, adaptedData.length);
             const prefixDist = euclideanDistance(
                 originalData.slice(0, commonLength),
                 adaptedData.slice(0, commonLength)
             );
             const lengthDiff = Math.abs(originalData.length - adaptedData.length);
             const avgStep = scaleIntervals.modulo / originalData.length || 1;
             distance = prefixDist + lengthDiff * avgStep;
         }
     } else {
         // Handle length mismatch - Penalize or use a different metric.
         // console.warn(`Scale length changed during adaptation (Original: ${originalScaleNormalized.data.length}, Adapted: ${adaptedScaleNormalized.data.length}). Distance metric might be less accurate.`); // Rimosso console.warn
         // Simple approach: Use Euclidean distance on the common prefix + penalty
         const commonLength = Math.min(originalScaleNormalized.data.length, adaptedScaleNormalized.data.length);
         // FIX: Filter undefined before slice and distance
         const originalData = originalScaleNormalized.data.filter((v): v is number => v != null);
         const adaptedData = adaptedScaleNormalized.data.filter((v): v is number => v != null);
         const prefixDist = euclideanDistance(
             originalData.slice(0, commonLength),
             adaptedData.slice(0, commonLength)
         );
         const lengthDiff = Math.abs(originalData.length - adaptedData.length);
         // Example penalty: average step size * length difference
         const avgStep = scaleIntervals.modulo / originalData.length || 1;
         distance = prefixDist + lengthDiff * avgStep;
     }


    // 8. Keep track of the best adapted scale (minimum distance to original)
    if (distance < minDistance) {
      minDistance = distance;
      bestAdaptedScale = currentModeScale; // Store the fully adapted scale
      finalRotation = best.rotation; // Store the rotation of the *initial* best mode
    }
  }

  // 9. Check if a best adapted scale was found
  if (!bestAdaptedScale) {
    // This might happen if bestOptions was empty or adaptation failed unexpectedly
    // console.error("No suitable adapted scale found after processing all candidates. Returning original scale."); // Rimosso console.error
     return { rotation: 0, data: scaleIntervals };
  }

  // 10. Convert the final best adapted scale (positionVector) back to an intervalVector
  const finalAdaptedIntervals = toIntervals(bestAdaptedScale);
  // Ensure the offset of the interval vector matches the root of the adapted scale
  // The root is the first element modulo the modulo value.
  // FIX: Check if bestAdaptedScale.data[0] is defined before using modulo (TS2345)
  const adaptedRoot = bestAdaptedScale.data[0];
  finalAdaptedIntervals.offset = adaptedRoot != null ? modulo(adaptedRoot, bestAdaptedScale.modulo) : 0; // Fallback to 0


  return {
    data: finalAdaptedIntervals,
    rotation: finalRotation,
  };
}
