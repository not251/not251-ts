import {
  AlterationSymbols,
  AlteredNoteName,
  Language,
  NoteNames,
} from "./constants";
import { minRotation } from "./distances";
import { scale } from "./scale";
import { modulo, lcm } from "./utility";

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
}

/**
 * Calculates the LCM of two positionVector instances and scales their data, modulo and span accordingly.
 *
 * @param a - The first positionVector instance.
 * @param b - The second positionVector instance.
 * @returns A tuple containing two positionVector instances scaled to the same modulo.
 */
function lcmPosition(
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
