import { positionVector } from "./positionVector";
import { intervalVector } from "./intervalVector";


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
  // FIX: Initialize 'out' with a specific type (number[] or (number | undefined)[])
  // If intervals can be undefined, use (number | undefined)[]. Assuming they are numbers:
  let out: number[] = new Array(n);
  let sum = s.offset;
  for (let i = 0; i < n; i++) {
    out[i] = sum;
    // FIX: Use non-null assertion assuming s.data[i] is always a number.
    // If s.data[i] can be undefined, check for it: sum += (s.data[i] ?? 0);
    sum += s.data[i]!; // (TS2532 fix)
  }
  sum -= s.offset;
  // FIX: Ensure 'out' contains only numbers if positionVector expects number[]
  const finalOut = out.filter((v): v is number => v !== undefined);
  return new positionVector(finalOut, s.modulo, sum);
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

  // FIX: Check if s.data is empty before accessing s.data[0]
  const offset = s.data.length > 0 ? s.data[0] : 0;

  for (let i = 0; i < n; i++) {
    let interval = s.element(i + 1) - s.element(i);
    out.push(interval);
  }

  // FIX: Ensure offset is a number before passing to intervalVector constructor
  return new intervalVector(out, s.modulo, offset ?? 0);
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
    // FIX: Use non-null assertion assuming j.data[i] is always a number.
    // If j.data[i] can be undefined, check for it: sum += (j.data[i] ?? 0);
    sum += j.data[i]!; // (TS2532 fix)
  }

  // FIX: Filter undefined values from v before creating positionVector
  const finalV = v.filter((val): val is number => val !== undefined);
  let out = new positionVector(finalV, s.modulo, s.span);
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
/*
export function names(
  vector: positionVector,
  desiredLanguages: Language[] = ["en"]
): Partial<NoteNames>[] {
  // FIX: Check if vector.data is empty
  if (!vector || vector.data.length === 0) {
      return [];
  }
  let scaleVector: positionVector = new positionVector(
    [...vector.data], // Create a copy
    vector.modulo,
    vector.span
  );
  let cMaj = scale();
  let a = minRotation(scaleVector, cMaj);

  //sto supponendo che entrambe le scale sia di uguale lunghezza
  // FIX: Check if scaleVector.data is empty before proceeding
  if (scaleVector.data.length === 0) {
      return [];
  }

  let trasp1 = cMaj.rototranslate(a, cMaj.data.length, false);
  let trasp2 = cMaj.rototranslate(a + 1, cMaj.data.length, false);

  // FIX: Add checks for undefined elements in data arrays using nullish coalescing (?? 0)
  let n = trasp1.data.map((value, index) => (value ?? 0) - (scaleVector.data[index] ?? 0)); // (TS2532 fix)
  let m = trasp2.data.map((value, index) => (value ?? 0) - (scaleVector.data[index] ?? 0)); // (TS2532 fix)

  let sum_n = n.reduce((acc, val) => acc + (val ?? 0), 0); //somma delle differenze
  let sum_m = m.reduce((acc, val) => acc + (val ?? 0), 0);

  let dorototraslata: positionVector;

  if (Math.abs(sum_n) < Math.abs(sum_m)) {
    dorototraslata = trasp1;
  } else {
    a = a + 1;
    dorototraslata = trasp2;
  }

  //l'algoritmo che porta a questo potrebbe essere ottimizzato

  let names: Partial<NoteNames>[] = [];

  // FIX: Check if dorototraslata.data is valid
  if (!dorototraslata || !dorototraslata.data) {
      //console.error("Error in names function: dorototraslata.data is undefined.");
      return [];
  }

  for (let i = 0; i < scaleVector.data.length; i++) {
    // FIX: Add checks for undefined elements using nullish coalescing (?? 0)
    let diff = (scaleVector.data[i] ?? 0) - (dorototraslata.data[i] ?? 0); // (TS2532 fix x2)

    let noteName: Partial<NoteNames> = {};
    for (let language of desiredLanguages) {
      // FIX: Use optional chaining and nullish coalescing for safe access
      const baseName = NoteNames[modulo(a + i, NoteNames.length)]?.[language] ?? ''; // (TS2532 fix)
      noteName[language] = baseName;

      if (diff > 0) {
        for (let j = 0; j < diff; j++) {
          // FIX: Ensure noteName[language] is a string before appending
          if (typeof noteName[language] === 'string') {
            noteName[language] += "#";
          }
        }
      } else if (diff < 0) {
        for (let j = 0; j < -diff; j++) {
           // FIX: Ensure noteName[language] is a string before appending
           if (typeof noteName[language] === 'string') {
             noteName[language] += "b";
           }
        }
      }
    }
    names.push(noteName);
  }
  return names;
}
*/