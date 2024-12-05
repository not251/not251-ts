import {
  AlterationSymbols,
  AlteredNoteName,
  Language,
  NoteNames,
} from "./constants";
import { minRotation } from "./distances";
import { scale } from "./scale";
import { modulo, lcm , scaleNames} from "./utility";

/**
 * Represents a cyclic vector, supporting various transformations like rototranslation,
 * inversion, and reflection. Defined by elements (data), a modulo constraint for cyclic properties,
 * and a span that represents the total range covered by the elements.
 */
export default class positionVector {
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
    this.data = data;
    this.modulo = modulo;
    this.span = span;
  }

  /**
   * Retrieves the element at a specific index, accounting for both positive and negative indices
   * and applying cyclic wrap-around based on the vector's length.
   * @param i The index to access (can be negative for reverse indexing).
   * @returns The element at the specified index, adjusted for cyclic behavior and span.
   */
  element(i: number): number {
    let n = this.data.length;
    let out = 0;
    if (i >= 0) {
      out = this.data[modulo(i, n)] + Math.abs(this.span) * ~~(i / n);
    } else {
      out =
        this.data[modulo(i, n)] + Math.abs(this.span) * (~~((i + 1) / n) - 1);
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
    let out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this.element(start + i);
    }
    if (autoupdate) this.data = out;

    return new positionVector(out, this.modulo, this.span);
  }

  /**
   * Updates the span to ensure it encompasses the full range of the vector's elements.
   * Expands the span by adding the modulo until it exceeds the difference between maximum and minimum values.
   */
  spanUpdate(): void {
    let maximum = this.data[0];
    let minimum = this.data[0];
    let span = this.modulo;

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] > maximum) {
        maximum = this.data[i];
      }
      if (this.data[i] < minimum) {
        minimum = this.data[i];
      }
    }

    let diff = maximum - minimum;
    if (span <= diff) {
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
    for (let i = 0; i < out.length; i++) {
      out[i] *= -1;
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
      for (let i = 0; i < out.length; i++) {
        out[i] *= 2;
      }
      pos = position * 2 - 1;
    }

    for (let i = 0; i < out.length; i++) {
      out[i] -= pos;
    }
    for (let i = 0; i < out.length; i++) {
      out[i] *= -1;
    }
    for (let i = 0; i < out.length; i++) {
      out[i] += pos;
    }

    if (standard) {
      for (let i = 0; i < out.length; i++) {
        out[i] /= 2;
      }
    }
    out.sort(function (a, b) {
      return a - b;
    });

    let outV: positionVector = new positionVector(out, this.modulo, this.span);

    outV.rototranslate(-1);

    if (autoupdate) this.data = out;
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

    for (let i = center - n; i < center + n; i++) {
      const option = this.rototranslate(i, n, false);
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
    for (let i = 0; i < p.data.length; i++) {
      v.push(this.element(p.data[i]));
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
    if (this.data.length === 0) {
      return this; // Return empty vector if the data is empty
    }

    let out: number[] = new Array(this.data.length);

    switch (axis) {
      case 0: {
        // First element
        const axisValue = this.data[0];
        for (let i = 0; i < this.data.length; i++) {
          out[i] = 2 * axisValue - this.data[i];
        }
        break;
      }
      case 2: {
        // Last element
        const axisValue = this.data[this.data.length - 1];
        for (let i = 0; i < this.data.length; i++) {
          out[i] = 2 * axisValue - this.data[i];
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
    let out : number[] = [...this.data];
    for (let i = 0; i < this.data.length; i++) {
      out[i] += num;
    }
    return new positionVector(out, this.modulo, this.span);
  }

  /**
   * It returns the note names for the input scale.
   * This only works for scales with 7 notes and modulo 12 for the moment.
   *
   * @param scaleVector positionVector for the input scale to find note names for.
   * @returns An array of noteNames objects, each containing the English and Italian note names.
   */
  /*
  names(desiredLanguages: Language[] = ["en"]): Partial<NoteNames>[] {
    let scaleVector: positionVector = new positionVector(
      this.data,
      this.modulo,
      this.span
    );
    let cMaj = scale();
    let a = minRotation(scaleVector, cMaj);

    //sto supponendo che entrambe le scale sia di uguale lunghezza

    let trasp1 = cMaj.rototranslate(a, cMaj.data.length, false);
    let trasp2 = cMaj.rototranslate(a + 1, cMaj.data.length, false);

    let n = trasp1.data.map((value, index) => value - scaleVector.data[index]); // differenza lineare tra due vettori
    let m = trasp2.data.map((value, index) => value - scaleVector.data[index]);

    let sum_n = n.reduce((acc, val) => acc + val, 0); //somma delle differenze
    let sum_m = m.reduce((acc, val) => acc + val, 0);

    let dorototraslata: positionVector;

    if (Math.abs(sum_n) < Math.abs(sum_m)) {
      dorototraslata = trasp1;
    } else {
      a = a + 1;
      dorototraslata = trasp2;
    }

    //l'algoritmo che porta a questo potrebbe essere ottimizzato

    let names: Partial<NoteNames>[] = [];

    for (let i = 0; i < scaleVector.data.length; i++) {
      let diff = scaleVector.data[i] - dorototraslata.data[i]; // Calcola la differenza senza modulo

      let noteName: Partial<NoteNames> = {};
      for (let language of desiredLanguages) {
        noteName[language] =
          NoteNames[modulo(a + i, NoteNames.length)][language];

        if (diff > 0) {
          for (let j = 0; j < diff; j++) {
            noteName[language] += "#";
          }
        } else if (diff < 0) {
          for (let j = 0; j < -diff; j++) {
            noteName[language] += "b";
          }
        }
      }
      names.push(noteName);
    }
    return names;
  }
*/

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
  names(lang: Language = "en"): AlteredNoteName[] {
    const scala = { ...this };
    const semitoneValue = scala.modulo / 12; // Each semitone in terms of modulo
    const cMaj = scale();

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

  /**
   * This method scales the vector to zero, effectively removing the offset.
   * TBI: remove duplicates in out.data!
   * @param autoupdate updates the original data array with the updated values (default is false).
   * @returns
   */
  toZero(autoupdate: boolean = false): positionVector {
    let out = new positionVector(this.data.slice(), this.modulo, this.span);

    this.sum(-out.data[0]);
    for (let i = 1; i < out.data.length; i++) {
      out.data[i] = modulo(out.data[i], out.modulo);
    }
    out.data.sort((a, b) => a - b);
    out.spanUpdate();

    //TBI: Remove duplicates in out.data!

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
     * @param num - The number to check for presence in this **positionVector**.
     * @returns `true` if the number is present in this **positionVector**, considering the modulo; `false` otherwise.
     */
    isNote(note: number): boolean {
      return this.data.includes(note);
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
      for (let i = 1; i < this.data.length; i++) {
        const chordNoteMod = modulo(this.data[i], this.modulo);
        const diff = modulo(num - chordNoteMod, this.modulo);
  
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
    // Shift the vector so that the root is at 0
    let shiftedVector = this.sum(-this.data[0]);
    let shiftedData = shiftedVector.data;
    for (let i = 1; i < shiftedData.length; i++) {
      shiftedData[i] = Math.round((shiftedData[i] * 12) / this.modulo);
    }

    let degFunc: (number | undefined)[] = new Array(this.data.length);
    degFunc[0] = 0; // The root has degree 0
    let intervalTypes = new Set<string>();
    let baseChord = new Set<number>();
    baseChord.add(0);

  // Determines the main degrees (third, fifth, seventh)
    for (let i = 1; i < shiftedData.length; i++) {
      if (shiftedData[i] == 4) {
        degFunc[i] = 2;
        baseChord.add(4);
        intervalTypes.add("3maj");
      }
      if (shiftedData[i] == 7) {
        degFunc[i] = 4;
        baseChord.add(7);
        intervalTypes.add("5");
      }
      if (shiftedData[i] == 11) {
        degFunc[i] = 6;
        baseChord.add(11);
        intervalTypes.add("7maj");
      }
    }

  // Searches for alternative intervals if the main ones are not present
    if (!intervalTypes.has("3maj")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 3) {
          degFunc[i] = 2;
          baseChord.add(3);
          intervalTypes.add("3min");
          break;
        }
      }
    }

    // If perfect fifth is not found and third is present, look for augmented fifth
    if (!intervalTypes.has("5") && !intervalTypes.has("3min")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 8) {
          degFunc[i] = 4;
          baseChord.add(8);
          intervalTypes.add("5aug");
          break;
        }
      }
    }

    // If neither major nor minor third is found, look for second as a substitute
    if (!intervalTypes.has("3maj") && !intervalTypes.has("3min")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 2) {
          degFunc[i] = 2;
          baseChord.add(2)
          intervalTypes.add("3dim");
          break;
        }
      }
    }

    // If third is not found, look for a fourth as a substitute for the third
    if (!intervalTypes.has("3maj") && !intervalTypes.has("3min") && !intervalTypes.has("3dim")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 5) {
          degFunc[i] = 2;
          baseChord.add(5)
          intervalTypes.add("3aug");
          break;
        }
      }
    }

    // Look for diminished fifth
    if (!intervalTypes.has("5") && !intervalTypes.has("5aug") && !intervalTypes.has("3maj")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 6) {
          degFunc[i] = 4;
          baseChord.add(6)
          intervalTypes.add("5dim");
          break;
        }
      }
    }

    // Look for minor seventh
    if (!intervalTypes.has("7maj")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 10) {
          degFunc[i] = 6;
          baseChord.add(10);
          intervalTypes.add("7min");
          break;
        }
      }
    }

    // Look for diminished seventh (major sixth)
    if (!intervalTypes.has("7maj") && !intervalTypes.has("7min")) {
      for (let i = 1; i < shiftedData.length; i++) {
        if (shiftedData[i] == 9) {
          degFunc[i] = 6;
          baseChord.add(9)
          intervalTypes.add("7dim");
          break;
        }
      }
    }

    // Assigns the remaining intervals (second, fourth, sixth)
    for (let i = 1; i < degFunc.length; i++) {
      if (degFunc[i] === undefined) {
        if (shiftedData[i] < 4) {
          degFunc[i] = 1;
          if (shiftedData[i] == 1) {
            intervalTypes.add("2min");
          } else if (shiftedData[i] == 2) {
            intervalTypes.add("2");
          } else if (shiftedData[i] == 3) {
            intervalTypes.add("2aug")
          }
        } else if (shiftedData[i] > 4 && shiftedData[i] < 7) {
          degFunc[i] = 3;
          if (shiftedData[i] == 5) {
            intervalTypes.add("4");
          } else if (shiftedData[i] == 6) {
            intervalTypes.add("4aug");
          }
        } else if (shiftedData[i] > 7 && shiftedData[i] < 11) {
          degFunc[i] = 5;
          if (shiftedData[i] == 8) {
            intervalTypes.add("6min");
          } else if (shiftedData[i] == 9) {
            intervalTypes.add("6");
          }
        }
      }
    }

    // Generates the detailed output
    const degreeFunction = this.data.map((note, index) => {
      const degree = degFunc[index];
      return {
        degree: degree!
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
    const { baseChord } = this.degreeFunction();
    // Shift the note relative to the root
    const shiftedNote = Math.round((modulo(note - this.data[0], this.modulo) * 12) / this.modulo);
    return !baseChord.has(shiftedNote);
  }

  /**
   * Returns the interval types computed by the degree function, sorted by the first character.
   * @returns An array of strings representing the interval types identified, sorted by the first character.
   */
  getIntervalTypes(): string[] {
    const intervalTypes = Array.from(this.degreeFunction().intervalTypes);
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
    return this.degreeFunction().degreeFunction.map(item => item.degree);
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
  let d = [];
  for (let i = 0; i < a.data.length; i++) {
    d.push((c / a.modulo) * a.data[i]);
  }
  let e = [];
  for (let i = 0; i < b.data.length; i++) {
    e.push((c / b.modulo) * b.data[i]);
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
  voicing.data.sort((a, b) => a - b);

  let index: positionVector = new positionVector(
    [],
    scala.data.length,
    scala.data.length
  );

  let j = Math.floor(voicing.data[0] / voicing.modulo);

  while (scala.element(j) > voicing.data[0]) {
    j--;
  }

  for (let i = 0; i < voicing.data.length; i++) {
    while (scala.element(j) < voicing.data[i]) {
      j++;
    }
    if (scala.element(j) == voicing.data[i]) {
      index.data.push(j);
    } else {
      // Messaggio di errore e interruzione della funzione
      throw new Error(
        "Errore: Impossibile trovare la corrispondenza per l'elemento " +
          voicing.data[i] +
          " nella scala."
      );
    }
  }

  return index;
}

/**
 * Determines the name of a chord from a given **positionVector**.
 *
 * Analyzes the interval types and chord quality to derive the chord name.
 * Supports basic and extended chords, including slash chords if specified.
 *
 * @param chordVector - The vector representing chord note positions.
 * @param allowSlashChords - Whether slash chords are allowed; defaults to `false`.
 * @returns The chord name as a string.
 */
function getChordName(chordVector : positionVector, allowSlashChords = false) {
  let chord = chordVector;
  chord = chord.sum(-chordVector.data[0]);

  for(let i = 1; i < chord.data.length; i++) {
    chord.data[i] = modulo(chord.data[i], chord.modulo);
  }
  chord.data.sort((a, b) => a - b);
  chord = chord.sum(+chordVector.data[0]);

  let candidates = [];
  let iTcandidates = [];
  let chordNames = [];
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
    candidates.push(candidate.data);

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
    } else if (!iTCandidate.has("3maj") && !iTCandidate.has("3min") && iTCandidate.has("3dim") && iTCandidate.has("3aug")) {
      chordBase = "5";
    }

    // Add seventh, sixth, or extended notes to the chord quality
    if (iTCandidate.has("7maj")) {
      chordQuality.push("maj7");
    } else if (iTCandidate.has("7min")) {
      if (chordBase == "dim") {
        chordBase = "ø";
      }
      chordQuality.push("7");
    } else if (iTCandidate.has("7dim")) {
      if (chordBase != "dim") {
        chordQuality.push("6");
      } else {
        chordQuality.push("7");
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
      } else{
      chordQuality.push("♭9");
      }
    }
    if (iTCandidate.has("2")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add9");
      } else{
      chordQuality.push("9");
      }
    }
    if (iTCandidate.has("2aug")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♯9");
      } else{
      chordQuality.push("♯9");
      }
    }
    if (iTCandidate.has("4") && !iTCandidate.has("3dim")) {
      if ((!iTCandidate.has("7maj") && !iTCandidate.has("7min")) || iTCandidate.has("3maj")) {
        chordQuality.push("add11");
      } else{
      chordQuality.push("11");
      }
    }
    if (iTCandidate.has("4aug")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♯11");
      } else{
      chordQuality.push("♯11");
      }
    }
    if (iTCandidate.has("6min")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add♭13");
      } else{
      chordQuality.push("♭13");
      }
    }
    if (iTCandidate.has("6")) {
      if (!iTCandidate.has("7maj") && !iTCandidate.has("7min")) {
        chordQuality.push("add13");
      } else{
      chordQuality.push("13");
      }
    }
    if (iTCandidate.has("6aug")){
      chordQuality.push("♯13")
    }
    if (!iTCandidate.has("3maj") && !iTCandidate.has("3min") && !iTCandidate.has("3aug") && !iTCandidate.has("3dim") ){
      chordQuality.push("omit3")
    }
    if (!iTCandidate.has("5") && !iTCandidate.has("5dim") && !iTCandidate.has("5aug")) {
      chordQuality.push("omit5");
    }


    // Determine the root note using scaleNames
    const rootName = scaleNames(candidate, false, false)[0];

    // Determine inversion if applicable and if slash chords are allowed
    if (allowSlashChords && i !== 0) {
      inversion = `/${scaleNames(chord, false, false)[0]}`;
    }

    // Store the chord components in an array
    chordNames.push([rootName, chordBase, chordQuality, inversion]);

  }

  // Sort chord names based on the length of chordQuality
  chordNames.sort((a, b) => a[2].length - b[2].length);
  
  let i = 0;
  while (i < chordNames.length && 
    ( chordNames[i][2].includes("omit3") || 
    (chordNames[i][2].includes("omit5") && (chordNames[i][2].includes("sus2") || chordNames[i][2].includes("sus4"))))) 
    {
    i++;
  }
  if (i >= chordNames.length) {
    i = 0; 
  }

  // Compose the final chord name from the best candidate
  const bestChord = chordNames[i];
  return `${bestChord[0]}${bestChord[1]}${Array.isArray(bestChord[2]) && bestChord[2].length > 0 ? bestChord[2].join("") : ""}${bestChord[3]}`;
}