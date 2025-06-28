import { minRotation } from "./distances";
import { modulo, lcm } from "./utility";
import { binaryVector } from "./binaryVector"; // FIX: Import binaryVector

/**
 * Represents a cyclic vector, supporting various transformations like rototranslation,
 * inversion, and reflection. Defined by elements (data), a modulo constraint for cyclic properties,
 * and a span that represents the total range covered by the elements.
 */
export class positionVector {
  data: number[];
  modulo: number;
  span: number;

  /**
   * Initializes a new PositionVector with specified elements, a modulo for cyclic properties,
   * and a span indicating the vector's range.
   * @param data An array of numeric elements representing the vector.
   * @param modulo A cyclical constraint defining the repeating interval.
   * @param span The range covered by the vector's elements.
   */
  constructor(data: number[], modulo: number = 12, span: number = 12) {
    // Ensure data is always number[] even if input might contain undefined somehow
    this.data = data.filter((v): v is number => v !== undefined);
    this.modulo = modulo;
    this.span = span;
  }

  /**
   * Retrieves the element at a specific index, accounting for both positive and negative indices
   * and applying cyclic wrap-around based on the vector's length.
   * @param i The index to access (can be negative for reverse indexing).
   * @returns The element at the specified index, adjusted for cyclic behavior and span, or 0 if data is empty.
   */
  element(i: number): number {
    let n = this.data.length;
    // FIX: Handle empty data array (TS2532)
    if (n === 0) {
        return 0; // Or throw an error
    }
    let out = 0;
    // FIX: Use non-null assertion assuming modulo logic prevents out-of-bounds if n > 0 (TS2532)
    const baseElement = this.data[modulo(i, n)]!;
    if (i >= 0) {
      out = baseElement + Math.abs(this.span) * ~~(i / n);
    } else {
      // FIX: Use non-null assertion (TS2532)
      out = baseElement + Math.abs(this.span) * (~~((i + 1) / n) - 1);
    }
    return out;
  }

  /**
   * Performs a rototranslation on the vector, effectively shifting elements in a cyclic manner
   * while also translating them based on the span. The operation starts from a specified index
   * and continues for a given number of elements.
   * @param start The starting index for rototranslation.
   * @param n The number of elements to include in the transformation (defaults to the vector's length).
   * @param autoupdate If true, updates the original data array with the transformed result (default is true).
   * @returns A new PositionVector representing the result of the rototranslation.
   */
  rototranslate(
    start: number,
    n: number = this.data.length,
    autoupdate: boolean = true
  ): positionVector {
    // FIX: Initialize 'out' explicitly as number[]
    let out: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
      // element() now returns number, so assignment is safe
      out[i] = this.element(start + i);
    }
    let data = this.data
    if (this.data === data.sort((a: number, b: number) => a - b)) {out = out.sort((a, b) => a - b)}
    if (autoupdate) this.data = out; // 'out' is now number[]

    return new positionVector(out, this.modulo, this.span);
  }

  /**
   * Updates the span to ensure it encompasses the full range of the vector's elements.
   * Expands the span by adding the modulo until it exceeds the difference between maximum and minimum values.
   */
  spanUpdate(): void {
    // FIX: Handle empty data array (TS2532, TS18048)
    if (this.data.length === 0) {
        this.span = this.modulo; // Or 0, depending on desired behavior for empty vector
        return;
    }

    // FIX: Initialize with the first element, now safe due to the check above (TS2532)
    let maximum = this.data[0]!;
    let minimum = this.data[0]!;
    let span = this.modulo;

    // Corretto: Usa < invece di &lt;
    for (let i = 1; i < this.data.length; i++) { // Start from 1 since 0 is used for init
      // FIX: Use non-null assertion assuming loop bounds are correct (TS2532)
      const currentVal = this.data[i]!;
      // FIX: Check if maximum/minimum are defined (handled by init) (TS18048)
      if (currentVal > maximum) {
        maximum = currentVal;
      }
      // FIX: Check if maximum/minimum are defined (handled by init) (TS18048)
      if (currentVal < minimum) {
        minimum = currentVal;
      }
    }

    // FIX: Check if maximum/minimum are defined (handled by init) (TS18048)
    let diff = maximum - minimum;
    // Corretto: Usa <= invece di &lt;=
    if (span <= diff) {
      // Corretto: Usa <= invece di &lt;=
      while (span <= diff) {
        span += this.modulo;
      }
    }
    this.span = span;
  }

  /**
   * Inverts the vector by reversing the sign of each element, effectively reflecting them around the origin.
   * Optionally updates the internal data array with the inverted values.
   * @param autoupdate If true, the original data array is updated with inverted values (default is true).
   * @returns A new PositionVector with inverted elements.
   */
  invert(autoupdate: boolean = true): positionVector {
    let out = this.data.slice();
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < out.length; i++) {
      // FIX: Use non-null assertion assuming loop bounds are correct (TS2532)
      out[i]! *= -1;
    }
    if (autoupdate) this.data = out;
    return new positionVector(out, this.modulo, this.span);
  }

  /**
   * Reflects the vector around a specified position, modifying each element to mirror around this axis.
   * When standard is true, elements are doubled before and halved after reflection.
   * @param position The axis for reflection (default is 10).
   * @param standard If true, elements are scaled before and after reflection (default is true).
   * @param autoupdate If true, updates the original data with the reflected values (default is true).
   * @returns A new PositionVector with reflected elements.
   */
  negative(
    position: number = 10,
    standard: boolean = true,
    autoupdate: boolean = true
  ): positionVector {
    let out = this.data.slice();
    let pos = position;
    if (standard) {
      // Corretto: Usa < invece di &lt;
      for (let i = 0; i < out.length; i++) {
        // FIX: Use non-null assertion (TS2532)
        out[i]! *= 2;
      }
      pos = position * 2 - 1;
    }

    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < out.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      out[i]! -= pos;
    }
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < out.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      out[i]! *= -1;
    }
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < out.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      out[i]! += pos;
    }

    if (standard) {
      // Corretto: Usa < invece di &lt;
      for (let i = 0; i < out.length; i++) {
        // FIX: Use non-null assertion (TS2532)
        out[i]! /= 2;
      }
    }
    // Corretto: Usa => invece di =&gt;
    out.sort(function (a, b) {
      return a - b;
    });

    let outV: positionVector = new positionVector(out, this.modulo, this.span);

    outV.rototranslate(-1); // This modifies outV in place

    if (autoupdate) this.data = outV.data; // Use the data from the rototranslated vector
    return outV;
  }

  /**
   * Generates a series of PositionVector transformations centered on a given value.
   * Each transformation is a rototranslation representing a shifted version of the original vector.
   * @param center The central value for generating transformations.
   * @returns An array of PositionVector objects, each representing a different rototranslation.
   */
  options(center: number): positionVector[] {
    let map: positionVector[] = [];
    let n = this.data.length;

    // Corretto: Usa < invece di &lt;
    for (let i = center - n; i < center + n; i++) {
      const option = this.rototranslate(i, n, false); // Use false to get new instances
      map.push(option);
    }
    return map;
  }

  /**
   * Creates a new PositionVector by selecting elements from the current vector based on indices from another PositionVector.
   * Updates the span to ensure the new vector's range fully covers its values.
   * @param p A PositionVector providing indices for element selection.
   * @returns A new PositionVector with selected elements and an updated span.
   */
  selectFromPosition(p: positionVector) {
    let v: number[] = [];
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < p.data.length; i++) {
      // FIX: Check if p.data[i] is defined before passing to element (TS2345)
      const indexVal = p.data[i];
      if (indexVal !== undefined) {
          v.push(this.element(indexVal));
      }
    }
    let out = new positionVector(v, this.modulo, this.span);
    out.spanUpdate();
    return out;
  }

  /**
   * Inverts the vector around a specified axis, which can be the first element, last element, or middle element.
   * The median (1) simply reverses the data, while the other options mirror elements around the selected axis.
   * @param axis The axis for inversion: 0 for first element, 1 for median (default), 2 for last element.
   * @returns A new PositionVector with elements inverted around the chosen axis.
   */
  freeInvert(axis: number = 1): positionVector {
    // FIX: Handle empty data array (TS2532, TS18048)
    if (this.data.length === 0) {
      return new positionVector([], this.modulo, this.span); // Return new empty vector
    }

    let out: number[] = new Array(this.data.length);

    switch (axis) {
      case 0: {
        // First element
        // FIX: Use non-null assertion, safe due to empty check (TS18048)
        const axisValue = this.data[0]!;
        // Corretto: Usa < invece di &lt;
        for (let i = 0; i < this.data.length; i++) {
          // FIX: Use non-null assertion (TS2532)
          out[i] = 2 * axisValue - this.data[i]!;
        }
        break;
      }
      case 2: {
        // Last element
        // FIX: Use non-null assertion, safe due to empty check (TS18048)
        const axisValue = this.data[this.data.length - 1]!;
        // Corretto: Usa < invece di &lt;
        for (let i = 0; i < this.data.length; i++) {
          // FIX: Use non-null assertion (TS2532)
          out[i] = 2 * axisValue - this.data[i]!;
        }
        break;
      }
      case 1:
      default:
        // Median case: reverse the array
        out = this.data.slice().reverse();
        break;
    }

    return new positionVector(out, this.modulo, this.span);
  }

  /**
   * Sums a specified number to each element of the positionVector instance.
   *
   * @param num - The number to add to each element of the positionVector. Defaults to 0.
   * @returns A new positionVector instance with summed values.
   */
  sum(num: number = 0): positionVector {
    let out: number[] = [...this.data];
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < this.data.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      out[i]! += num;
    }
    return new positionVector(out, this.modulo, this.span);
  }

  /**
 * funzione per visualizzare web chord notes

  let scala = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);
  let chordNotes = chord({ scala: scala });

  let index_chord = inverse_select(chordNotes, scala);

  let nomi_scala = scaleNames(scala);

  for (let i = 0; i < index_chord.data.length; i++) {
    console.log(nomi_scala[index_chord.data[i]]);
  }
 */

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

  /*
  names(lang: Language = "en"): AlteredNoteName[] {
    const scala = { ...this };
    const semitoneValue = scala.modulo / 12; // Each semitone in terms of modulo
    const cMaj = scale(defaultScaleParams);

    // Determine the key (starting note)
    const keyValue = modulo(scala.data[0], scala.modulo);

    // Find the closest note name to the key
    let minDiff = Infinity;
    let keyNoteIndex = 0;

    for (let i = 0; i < cMaj.data.length; i++) {
      const degree = cMaj.data[i];
      const refValue = (degree * scala.modulo) / cMaj.modulo;
      const diff = Math.abs(refValue - keyValue);

      if (diff < minDiff) {
        minDiff = diff;
        keyNoteIndex = i;
      }
    }

    // Rotate NoteNames and standardDegrees to match the key
    const rotatedNoteNames: NoteNames[] = [];
    const rotatedDegrees: number[] = [];

    for (let i = keyNoteIndex; i < NoteNames.length; i++) {
      rotatedNoteNames.push(NoteNames[i]);
      rotatedDegrees.push(cMaj.data[i]);
    }

    for (let i = 0; i < keyNoteIndex; i++) {
      rotatedNoteNames.push(NoteNames[i]);
      rotatedDegrees.push(cMaj.data[i]);
    }

    let usedNotes: { [key: string]: boolean } = {}; // To prevent duplicate note names

    let output = scala.data.map(function (
      value: number,
      idx: number
    ): AlteredNoteName | undefined {
      let bestName: NoteNames | undefined = undefined;

      let minScore = Infinity;
      let bestSteps = 0;
      let bestAccidentals = 0;

      // Consider degrees within ±2 of the expected degree
      for (let degreeOffset = -2; degreeOffset <= 2; degreeOffset++) {
        let degreeIndex =
          (idx + degreeOffset + rotatedDegrees.length) % rotatedDegrees.length;
        let degree = rotatedDegrees[degreeIndex];
        let name = rotatedNoteNames[degreeIndex];

        // Try octave offsets to find the closest reference value
        for (let octaveOffset = -1; octaveOffset <= 1; octaveOffset++) {
          let refValue =
            (degree * scala.modulo) / 12 + octaveOffset * scala.modulo;
          let diff = value - refValue;
          let steps = diff / semitoneValue; // Difference in semitones
          let absSteps = Math.abs(steps);

          if (absSteps <= 1) {
            // Limit adjustments to within one semitone (±50 cents)
            let roundedSteps = Math.round(steps * 2) / 2; // Round to nearest 0.5 for quarter tones
            let accidentals = Math.abs(roundedSteps);
            let penalty = usedNotes[name[lang]] ? 1 : 0;
            let score =
              absSteps + accidentals + penalty + Math.abs(degreeOffset) * 0.5; // Penalize distant degrees

            if (score < minScore) {
              minScore = score;
              bestName = name;
              bestSteps = steps;
              bestAccidentals = roundedSteps;
            }
          }
        }
      }

      //// If no suitable note is found, return a placeholder
      if (bestName === undefined) {
        return undefined;
      }

      let out: AlteredNoteName = {
        name: bestName[lang],
        base: bestName,
        cents: undefined,
        alterations: undefined,
      };

      if (bestName != undefined) {
        usedNotes[bestName[lang]] = true;

        let cents = Math.round(bestSteps * 50);

        // Generate the note name with appropriate alterations
        out.cents =
          (cents > 0
            ? AlterationSymbols.positive
            : AlterationSymbols.negative) +
          Math.abs(cents) +
          AlterationSymbols.cents;

        let roundedSteps = Math.round(bestSteps);
        if (Math.abs(bestSteps) < 1 && bestSteps !== 0) {
          out.name = out.name + (roundedSteps > 0 ? "𝄲" : "𝄳"); // Microtonal symbols
        } else if (roundedSteps !== 0) {
          let alteration = roundedSteps > 0 ? "♯" : "♭";
          out.name =
            out.name +
            Array(Math.min(Math.abs(roundedSteps), 2) + 1).join(alteration);
        }
        return out;
      }
    });
    return output.filter((item): item is AlteredNoteName => item !== undefined);
  }
*/
  /**
   * This method scales the vector to zero, effectively removing the offset.
   * TBI: remove duplicates in out.data!
   * @param autoupdate updates the original data array with the updated values (default is false).
   * @returns
   */
  toZero(autoupdate: boolean = false): positionVector {
    // FIX: Handle empty data array (TS2532, TS18048)
    if (this.data.length === 0) {
        return new positionVector([], this.modulo, this.span);
    }
    let out = new positionVector(this.data.slice(), this.modulo, this.span);

    // FIX: Use non-null assertion, safe due to empty check (TS2532, TS18048)
    let offset = out.data[0]!;
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < out.data.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      out.data[i] = modulo(out.data[i]! - offset, out.modulo);
    }

    // Corretto: Usa => invece di =&gt;
    out.data.sort((a, b) => a - b);

    out.spanUpdate();

    if (autoupdate) {
      this.data = out.data;
      this.span = out.span;
      this.modulo = out.modulo;
    }

    return out;
  }

  /**
   * Checks if a given number is present in this **positionVector**, considering modular equivalence.
   *
   * @param note - The number to check for presence in this **positionVector**.
   * @returns `true` if the number is present in this **positionVector**, considering the modulo; `false` otherwise.
   */
  isNote(note: number): boolean {
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < this.data.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      if (modulo(this.data[i]!, this.modulo) === modulo(note, this.modulo)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines if a given note is an **avoid note** with respect to this **positionVector** (interpreted as a chord).
   *
   * A note is considered an avoid note if:
   * - It is not already present in the chord.
   * - The difference between the note and any note in the chord (excluding the root) is equal to half the modulo of the chord.
   *
   * The comparison is made for each note in the chord except the fundamental (first note).
   *
   * @param num - The note to check as an avoid note.
   * @returns `true` if the note is an avoid note; `false` otherwise.
   */
  isAvoid(num: number): boolean {
    // Check if the note is already in the chord
    if (this.isNote(num)) {
      return false;
    }

    const halfModulo = this.modulo / 2;

    // Compare with each note in the chord, excluding the fundamental (index 0)
    // Corretto: Usa < invece di &lt;
    for (let i = 1; i < this.data.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      const chordNoteMod = modulo(this.data[i]!, this.modulo);
      const diff = modulo(num - chordNoteMod, this.modulo);

      // Corretto: Usa === invece di ==
      if (diff === halfModulo) {
        return true; // The note is an avoid note
      }
    }

    return false; // The note is not an avoid note
  }

  /**
   * Computes the degree function for this positionVector, assigning degrees to each note in the scale.
   * Additionally, determines the interval types for the scale.
   * @returns An object containing the degree information, interval types, and the base chord.
   */
  degreeFunction(): { degreeFunction: { degree: number }[], intervalTypes: Set<string>, baseChord: Set<number> } {
    // FIX: Handle empty data array
    if (this.data.length === 0) {
        return { degreeFunction: [], intervalTypes: new Set(), baseChord: new Set() };
    }
    // FIX: Use non-null assertion, safe due to empty check (TS2532)
    let shiftedVector = this.sum(-this.data[0]!).normalizeToModulo();
    let shiftedData = shiftedVector.data;
    let binaryData = shiftedVector.toBinary().data;
    let pool = Array.from({ length: this.data.length }, (_, i) => i);

    // Corretto: Usa < invece di &lt;
    for (let i = 1; i < shiftedData.length; i++) {
      // FIX: Use non-null assertion (TS2532)
      shiftedData[i] = modulo(Math.round((shiftedData[i]! * 12) / this.modulo),12);
    }
    let degFunc: (number | undefined)[] = new Array(this.data.length);
    degFunc[0] = 0; // The root has degree 0
    let intervalTypes = new Set<string>();
    let baseChord = new Set<number>();
    baseChord.add(0);


  // Determines the main degrees (third, fifth, seventh)
    for (const i of pool.slice()) {
      // FIX: Use non-null assertion (TS2532)
      const shiftedVal = shiftedData[i]!;
      // Corretto: Usa === invece di ==
      if (shiftedVal == 0) {
        degFunc[i] = 0;
        intervalTypes.add("f");
        pool.splice(pool.indexOf(i), 1);
      }
      // Corretto: Usa === invece di ==
      if (shiftedVal == 4) {
        degFunc[i] = 2;
        baseChord.add(4);
        intervalTypes.add("3maj");
        pool.splice(pool.indexOf(i), 1);
      }
      // Corretto: Usa === invece di ==
      if (shiftedVal == 7) {
        degFunc[i] = 4;
        baseChord.add(7);
        intervalTypes.add("5");
        pool.splice(pool.indexOf(i), 1);
      }
      // Corretto: Usa === invece di ==
      if (shiftedVal == 11) {
        degFunc[i] = 6;
        baseChord.add(11);
        intervalTypes.add("7maj");
        pool.splice(pool.indexOf(i), 1);
      }
    }

  // Searches for alternative intervals if the main ones are not present
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("3maj") && binaryData[3] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 3) {
          degFunc[i] = 2;
          baseChord.add(3);
          intervalTypes.add("3min");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // If perfect fifth is not found and third is present, look for augmented fifth
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("5") && !intervalTypes.has("3min") && binaryData[8] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 8) {
          degFunc[i] = 4;
          baseChord.add(8);
          intervalTypes.add("5aug");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // If neither major nor minor third is found, look for second as a substitute
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("3maj") && !intervalTypes.has("3min") && binaryData[2] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 2) {
          degFunc[i] = 2;
          baseChord.add(2)
          intervalTypes.add("3dim");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // If third is not found, look for a fourth as a substitute for the third
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("3maj") && !intervalTypes.has("3min") && !intervalTypes.has("3dim") && binaryData[5] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 5) {
          degFunc[i] = 2;
          baseChord.add(5)
          intervalTypes.add("3aug");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // Look for diminished fifth
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("5") && !intervalTypes.has("5aug") && !intervalTypes.has("3maj") && binaryData[6] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 6) {
          degFunc[i] = 4;
          baseChord.add(6)
          intervalTypes.add("5dim");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // Look for minor seventh
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("7maj") && binaryData[10] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 10) {
          degFunc[i] = 6;
          baseChord.add(10);
          intervalTypes.add("7min");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // Look for diminished seventh (major sixth)
    // Corretto: Usa === invece di ==
    if (!intervalTypes.has("7maj") && !intervalTypes.has("7min") && binaryData[9] == true) {
      for (const i of pool) {
        // FIX: Use non-null assertion (TS2532)
        // Corretto: Usa === invece di ==
        if (shiftedData[i]! == 9) {
          degFunc[i] = 6;
          baseChord.add(9)
          intervalTypes.add("7dim");
          pool.splice(pool.indexOf(i), 1);
          break;
        }
      }
    }

    // Assigns the remaining intervals (second, fourth, sixth)
    for (const i of pool) {
      // FIX: Use non-null assertion (TS2532)
      const shiftedVal = shiftedData[i]!;
      // Corretto: Usa < invece di &lt;
      if (shiftedVal < 4) {
        degFunc[i] = 1;
        // Corretto: Usa === invece di ==
        if (shiftedVal == 1) {
          intervalTypes.add("2min");
        // Corretto: Usa === invece di ==
        } else if (shiftedVal == 2) {
          intervalTypes.add("2");
        // Corretto: Usa === invece di ==
        } else if (shiftedVal == 3) {
          intervalTypes.add("2aug")
        }
      // Corretto: Usa > invece di &gt; e < invece di &lt;
      } else if (shiftedVal > 4 && shiftedVal < 7) {
        degFunc[i] = 3;
        // Corretto: Usa === invece di ==
        if (shiftedVal == 5) {
          intervalTypes.add("4");
        // Corretto: Usa === invece di ==
        } else if (shiftedVal == 6) {
          intervalTypes.add("4aug");
        }
      // Corretto: Usa > invece di &gt; e < invece di &lt;
      } else if (shiftedVal > 7 && shiftedVal < 11) {
        degFunc[i] = 5;
        // Corretto: Usa === invece di ==
        if (shiftedVal == 8) {
          intervalTypes.add("6min");
        // Corretto: Usa === invece di ==
        } else if (shiftedVal == 9) {
          intervalTypes.add("6");
        } else if (shiftedVal == 10) {
          intervalTypes.add("6aug");
        }
      }
    }

    // Generates the detailed output
    // Corretto: Usa => invece di =&gt;
    const degreeFunction = this.data.map((note, index) => {
      // FIX: Provide fallback for undefined degree (TS2345)
      const degree = degFunc[index] ?? -1; // Use -1 or another indicator for undefined
      return {
        degree: degree
      };
    });

    return { degreeFunction, intervalTypes, baseChord };
  }

  /**
   * Checks if a given note is an extension in the current positionVector.
   * @param note The note to check.
   * @returns `true` if the note is an extension, `false` otherwise.
   */
  isExtension(note: number): boolean {
    // FIX: Handle empty data array
    if (this.data.length === 0) return false;
    const { baseChord } = this.degreeFunction();
    // FIX: Use non-null assertion, safe due to empty check (TS2345)
    const rootNote = this.data[0]!;
    // Shift the note relative to the root
    const shiftedNote = Math.round(
      (modulo(note - rootNote, this.modulo) * 12) / this.modulo
    );
    return !baseChord.has(shiftedNote);
  }

  /**
   * Returns the interval types computed by the degree function, sorted by the first character.
   * @returns An array of strings representing the interval types identified, sorted by the first character.
   */
  getIntervalTypes(): string[] {
    const intervalTypes = Array.from(this.degreeFunction().intervalTypes);
    // Corretto: Usa => invece di =&gt;
    return intervalTypes.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return numA - numB;
    });
  }

  /**
   * Gets only the degrees for each note in the scale.
   * @returns An array of degrees representing each note.
   */
  getDegrees(): number[] {
    // Corretto: Usa => invece di =&gt;
    return this.degreeFunction().degreeFunction.map((item) => item.degree);
  }

  /**
   * Normalizes all elements of the position vector to be within the range [0, modulo).
   * Ensures that the first element in the resulting vector is the lowest value among the normalized elements.
   * Other elements are adjusted relative to the first to maintain their relative positions.
   *
   * @returns A new positionVector instance with normalized values.
   */
  normalizeToModulo(): positionVector {
    // FIX: Handle empty data array
    if (this.data.length === 0) {
        return new positionVector([], this.modulo, this.span);
    }
    // Corretto: Usa => invece di =&gt;
    const normalizedData = this.data.map((note) => modulo(note, this.modulo));
    // FIX: Use non-null assertion, safe due to empty check (TS18048)
    const minVal = normalizedData[0]!;
    // Corretto: Usa => invece di =&gt;
    const adjustedData = normalizedData.map((note) => {
      // Corretto: Usa < invece di &lt;
      if (note < minVal) {
        return note + this.modulo;
      }
      return note;
    });
    return new positionVector(adjustedData, this.modulo, this.span);
  }

    /**
   * Converts the current positionVector into a binaryVector.
   * The resulting binaryVector has a boolean array with length equal to the span,
   * where each position is set to true if the corresponding normalized value from the positionVector's data
   * (after shifting so that the first element is zero) falls at that index modulo span.
   *
   * @returns A binaryVector representing the binary mapping of the positionVector's data.
   */
  toBinary(): binaryVector { // FIX: Correct return type (TS2304)
    // FIX: Handle empty data array
    if (this.data.length === 0) {
        return new binaryVector([], this.modulo, 0); // Return empty binary vector
    }
    // Create a new binaryVector with a boolean array of length equal to the span, all initialized to false.
    // The offset is set to the first element of the positionVector's data.
    // FIX: Use non-null assertion, safe due to empty check (TS2532)
    let result = new binaryVector(new Array(this.span).fill(false), this.modulo, this.data[0]!); // FIX: Correct class name (TS2304)

    // Normalize the positionVector so that the first element becomes zero.
    // FIX: Use non-null assertion, safe due to empty check (TS2532)
    let transposed = this.sum(-this.data[0]!);

    // For each number in the normalized data, compute its index modulo the span
    // and set the corresponding position in the binary vector to true.
    for (const num of transposed.data) {
      // FIX: Check if num is defined
      if (num !== undefined) {
          let index = modulo(num, this.span);
          // Check bounds before assignment
          if (index >= 0 && index < result.data.length) {
              result.data[index] = true;
          }
      }
    }

    return result;
  }
}

/**
 * Calculates the LCM of two positionVector instances and scales their data, modulo and span accordingly.
 *
 * @param a - The first positionVector instance.
 * @param b - The second positionVector instance.
 * @returns A tuple containing two positionVector instances scaled to the same modulo.
 */
export function lcmPosition(
  a: positionVector,
  b: positionVector
): [positionVector, positionVector] {
  if (a.modulo === b.modulo) {
    return [a, b];
  }
  let c = lcm(a.modulo, b.modulo);
  let d: number[] = []; // Explicitly type as number[]
  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < a.data.length; i++) {
    // FIX: Use non-null assertion (TS2532)
    d.push((c / a.modulo) * a.data[i]!);
  }
  let e: number[] = []; // Explicitly type as number[]
  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < b.data.length; i++) {
    // FIX: Use non-null assertion (TS2532)
    e.push((c / b.modulo) * b.data[i]!);
  }
  return [
    new positionVector(d, c, (c / a.modulo) * a.span),
    new positionVector(e, c, (c / b.modulo) * b.span),
  ];
}

export function inverse_select(
  voicing: positionVector,
  scala: positionVector
  ): positionVector {
  // Ordina voicing per evitare che possa rompersi
  // FIX: Handle empty voicing data (TS2532)
  if (voicing.data.length === 0) {
      return new positionVector([], scala.data.length, scala.data.length);
  }

  const safe = voicing.data.every(voicingNote => {
    // Il metodo isNote della scala gestisce il controllo modulare.
    // Aggiungiamo un controllo per assicurarci che voicingNote sia un numero.
    if (typeof voicingNote !== 'number') {
         // Considera il controllo fallito se un elemento non è un numero.
        throw new Error(`inverse_select: Trovato valore non numerico in voicing.data: ${voicingNote}`);
    }
    return scala.isNote(voicingNote);
  });

  let index: positionVector = new positionVector(
    [],
    scala.data.length,
    scala.data.length
  );

  // FIX: Use non-null assertion, safe due to empty check (TS2532)
  const firstVoicingNote = voicing.data[0]!;
  let j = Math.floor(firstVoicingNote / voicing.modulo);
  // FIX: Check if scala.element result is valid (TS2532)
  let scalaElementJ = scala.element(j);
  // Corretto: Usa > invece di &gt;
  if (scalaElementJ > firstVoicingNote) {
    // Corretto: Usa > invece di &gt;
    while (scalaElementJ > firstVoicingNote) {
      j--;
      scalaElementJ = scala.element(j);
    }
  // Corretto: Usa < invece di &lt;
  } else if (scalaElementJ < firstVoicingNote) {
    // Corretto: Usa < invece di &lt;
    while (scalaElementJ < firstVoicingNote) {
      j++;
      scalaElementJ = scala.element(j);
    }
  j--;
  }
  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < voicing.data.length; i++) {
    // FIX: Use non-null assertion (TS2532)
    const currentVoicingNote = voicing.data[i]!;
    scalaElementJ = scala.element(j); // Update scalaElementJ inside the loop
    // Corretto: Usa < invece di &lt;
    while (scalaElementJ < currentVoicingNote) {
      j++;
      scalaElementJ = scala.element(j);
    }
    // Corretto: Usa == invece di ==
    if (scalaElementJ == currentVoicingNote) {
      index.data.push(j);
    } else if (safe) {
      // Siamo andati oltre (scalaElementJ > currentVoicingNote), ma sappiamo che la nota esiste.
      // Cerchiamo all'indietro partendo da j-1.
      let foundCorrectIndex = false;
      let correctIndex;
      // Cerca indietro per un numero limitato di passi (es. la lunghezza della scala) per sicurezza
      for (let k = j - 2*scala.data.length; k < j + 2*scala.data.length; k++) {
          if (scala.element(k) === currentVoicingNote) {
              correctIndex = k;
              foundCorrectIndex= true;
              break; // Trovato!
          }
          // Opzionale: potremmo fermarci se scendiamo troppo sotto la nota cercata?
          // if (scala.element(k) < currentVoicingNote - scala.modulo) {
          //    break; // Probabilmente non la troveremo più indietro
          // }
      }
  
      if (foundCorrectIndex) {
          index.data.push(correctIndex!);
          // Potremmo aggiornare j per la prossima iterazione, anche se non strettamente necessario
          // j = foundCorrectIndex;
      } else {
          // Questo blocco non dovrebbe essere raggiunto se 'safe' è affidabile.
          // Indica un'incongruenza tra isNote e la ricerca con element().
          throw new Error(
              `Inconsistenza Logica: La nota ${currentVoicingNote} doveva essere nella scala ${scala.data} (safe=true), ma la ricerca alternativa non l'ha trovata.`
          );
      }
    }
  }
  return index;
}