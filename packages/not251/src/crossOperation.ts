import { positionVector } from "./positionVector";
import { intervalVector } from "./intervalVector";
import { Language, NoteNames } from "./constants";
import { minRotation } from "./distances";
import { scale } from "./scale";
import { modulo } from "./utility";

/**
 *
 * Converts an IntervalVector into a PositionVector.
 * Starts from an initial offset value and iteratively sums the intervals, storing cumulative sums in the out array to represent the resulting positions.
 * The final sum, adjusted by the initial offset, determines the span for the new PositionVector.
 * @param {intervalVector} s - The IntervalVector to convert, containing interval data, modulo, and offset.
 * @returns {positionVector} A new PositionVector constructed from the summed intervals.
 */
export function toPositions(s: intervalVector): positionVector {
  let n = s.data.length;
  let out = new Array(n);
  let sum = s.offset;
  for (let i = 0; i < n; i++) {
    out[i] = sum;
    sum += s.data[i];
  }
  sum -= s.offset;
  return new positionVector(out, s.modulo, sum);
}

/**
 * Converts a PositionVector into an IntervalVector.
 * Calculates the interval between consecutive elements in the data array by finding the difference between each element and its successor.
 * These differences are stored in the out array as intervals, which form the IntervalVector. The first element of data sets the initial offset.
 * @param {positionVector} s - The PositionVector to convert, containing position data, modulo, and span.
 * @returns {intervalVector} A new IntervalVector constructed from the calculated intervals.
 */
export function toIntervals(s: positionVector): intervalVector {
  let out: number[] = [];
  let n = s.data.length;

  for (let i = 0; i < n; i++) {
    let interval = s.element(i + 1) - s.element(i);
    out.push(interval);
  }

  return new intervalVector(out, s.modulo, s.data[0]);
}

/**
 * Constructs a PositionVector by selecting elements from an existing PositionVector (s) based on cumulative intervals provided by an IntervalVector (j).
 * The selection starts from the offset in j, with subsequent positions determined by iteratively adding intervals from j to this sum.
 * The resulting vector is adjusted to cover its range via spanUpdate.
 * @param {positionVector} s - The PositionVector from which elements are selected.
 * @param {intervalVector} j - The IntervalVector providing the cumulative intervals for selection.
 * @returns {positionVector} A new PositionVector constructed from the selected elements, adjusted via spanUpdate.
 */
export function selectFromInterval(s: positionVector, j: intervalVector) {
  let v: number[] = [];
  let sum = j.offset;

  for (let i = 0; i < j.data.length; i++) {
    v.push(s.element(sum));
    sum += j.data[i];
  }

  let out = new positionVector(v, s.modulo, s.span);
  out.spanUpdate();

  return out;
}

/**
 * TBI: !!!OLD!!!!!
 *
 *
 * It returns the note names for the input scale.
 * This only works for scales with 7 notes and modulo 12 for the moment.
 *
 * @param scaleVector positionVector for the input scale to find note names for.
 * @returns An array of noteNames objects, each containing the English and Italian note names.
 */

export function names(
  vector: positionVector,
  desiredLanguages: Language[] = ["en"]
): Partial<NoteNames>[] {
  let scaleVector: positionVector = new positionVector(
    vector.data,
    vector.modulo,
    vector.span
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
      noteName[language] = NoteNames[modulo(a + i, NoteNames.length)][language];

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
