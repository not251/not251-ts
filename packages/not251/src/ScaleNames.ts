import { scaleNames } from "./chord";
import { positionVector } from "./positionVector";

const scalePool = [
  {
    name: "Lidia Dominate",
    degrees: [0, 2, 4, 6, 7, 9, 10],
  },
  {
    name: "Superlocria",
    degrees: [0, 1, 3, 4, 6, 8, 10],
  },
  {
    name: "Maggiore armonica",
    degrees: [0, 2, 4, 5, 7, 8, 11],
  },
  {
    name: "Minore armonica",
    degrees: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    name: "Minore melodica",
    degrees: [0, 2, 3, 5, 7, 9, 11],
  },
  {
    name: "Locria",
    degrees: [0, 1, 3, 5, 6, 8, 10],
  },
  {
    name: "Minore naturale",
    degrees: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    name: "Lidia",
    degrees: [0, 2, 4, 6, 7, 9, 11],
  },
  {
    name: "Frigia",
    degrees: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    name: "Dorica",
    degrees: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    name: "Maggiore",
    degrees: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    name: "Misolidia",
    degrees: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    name: "Esatonica",
    degrees: [0, 2, 4, 6, 8, 10],
  },
  {
    name: "Pentatonica Maggiore",
    degrees: [0, 2, 4, 7, 9],
  },
  {
    name: "Pentatonica Minore",
    degrees: [0, 3, 5, 7, 10],
  },
  {
    name: "Blues",
    degrees: [0, 3, 5, 6, 7, 10],
  },
];
  
/**
 * Generates all possible combinations of an array's elements (including null values) 
 * such that the resulting combinations have a fixed length and include all elements 
 * of the input array at least once.
 *
 * @template T - The type of the elements in the input array.
 * @param {T[]} arr - The input array whose elements are used to generate combinations.
 * @param {number} n - The desired length of the generated combinations.
 * @returns {(T | null)[][]} - An array of combinations, each of which is an array of length `n` 
 * containing elements of the input array and null values.
 * @throws {Error} - Throws an error if `n` is less than the length of the input array.
 */
function generateCombinations<T>(arr: T[], n: number): (T | null)[][] {
  if (n < arr.length) {
      throw new Error("n must be greater than or equal to the length of the input array.");
  }

  const m = arr.length; // The length of the input array.
  const combinations: (T | null)[][] = []; // Stores all valid combinations.

  /**
   * A helper function that recursively builds combinations.
   *
   * @param {(T | null)[]} current - The current combination being constructed.
   * @param {number} index - The current index in the input array being processed.
   */
  function backtrack(
      current: (T | null)[],
      index: number
  ): void {
      // If the combination has reached the desired length
      if (current.length === n) {
          // Check if all elements of the input array are included
          const includesAll = arr.every((element) => current.includes(element));
          if (includesAll) {
              combinations.push([...current]); // Add the combination to the results
          }
          return;
      }

      // Add an element from the input array and recurse
      if (index < m) {
          current.push(arr[index]);
          backtrack(current, index + 1);
          current.pop(); // Backtrack by removing the last added element
      }

      // Add a null value and recurse
      current.push(null);
      backtrack(current, index); // Index remains the same because null is not part of the input array
      current.pop(); // Backtrack by removing the null
  }

  backtrack([], 0); // Start the recursive process with an empty combination
  return combinations;
}

  /**
 * Aligns two scales by matching their degrees and positioning them correctly
 * at the same index based on the degree they represent.
 *
 * @param {positionVector} scaleA - The input scale to be analyzed.
 * @param {positionVector} scaleB - The reference scale for alignment.
 * @returns {[(number | null)[], (number | null)[]]} - Two aligned arrays: `alignedA` and `alignedB`.
 */
function alignScales(
  scaleA: positionVector,
  scaleB: positionVector
): [(number | null)[], (number | null)[]] {
  // Assuming getDegrees() always returns an array of numbers.
  const degreesA = scaleA.getDegrees() as number[];
  const degreesB = scaleB.getDegrees() as number[];

  // If the degrees are identical, return the original data arrays.
  if (degreesA === degreesB) {
    return [scaleA.data, scaleB.data];
  }

  // Calculate the shift needed to align the scales.
  const shifting = scaleA.data[0]! - scaleB.data[0]!;
  const newB = scaleB.sum(shifting);

  const maxLength = Math.max(scaleA.data.length, scaleB.data.length);
  const alignedA: (number | null)[] = Array.from({ length: maxLength }, () => null);
  const alignedB: (number | null)[] = Array.from({ length: maxLength }, () => null);

  let index = 0;
  let indexA = 0;
  let indexB = 0;

  while (index < maxLength) {
    const degA = degreesA[indexA]!;
    const degB = degreesB[indexB]!;

    if (degA === degB && degreesA[indexA + 1]! !== degA && degreesB[indexB + 1]! !== degB) {
      alignedA[index] = scaleA.data[indexA];
      alignedB[index] = newB.data[indexB];
      indexA++;
      indexB++;
      index++;
    } else if (degA === degB) {
      let iA = 1;
      while (degreesA[indexA + iA] === degreesA[indexA]) {
        iA++;
      }

      let iB = 1;
      while (degreesB[indexB + iB] === degreesB[indexB]) {
        iB++;
      }

      let iC = Math.max(iA, iB);
      let a: (number | null)[] = Array.from({ length: iC }, () => null);
      let b: (number | null)[] = Array.from({ length: iC }, () => null);

      if (iA > iB) {
        a = scaleA.data.slice(indexA, indexA + iA);
        const btemp = newB.data.slice(indexB, indexB + iB);
        const bComb = generateCombinations(btemp, iC);

        let best = Infinity;
        let idxBest = 0;
        for (let i = 0; i < bComb.length; i++) {
          let dist = 0;
          for (let j = 0; j < bComb[i].length; j++) {
            if (bComb[i][j] != null && a[j] != null) {
              dist += Math.abs(bComb[i][j]! - a[j]!);
            }
          }
          if (dist < best) {
            best = dist;
            idxBest = i;
          }
        }
        b = bComb[idxBest];
      } else {
        const aTemp = scaleA.data.slice(indexA, indexA + iA);
        b = newB.data.slice(indexB, indexB + iB);
        const aComb = generateCombinations(aTemp, iC);

        let best = Infinity;
        let idxBest = 0;
        for (let i = 0; i < aComb.length; i++) {
          let dist = 0;
          for (let j = 0; j < aComb[i].length; j++) {
            if (aComb[i][j] != null && b[j] != null) {
              dist += Math.abs(aComb[i][j]! - b[j]!);
            }
          }
          if (dist < best) {
            best = dist;
            idxBest = i;
          }
        }
        a = aComb[idxBest];
      }

      indexA += iA;
      indexB += iB;

      let c = 0;
      while (iC > 0) {
        alignedA[index] = a[c];
        alignedB[index] = b[c];
        c++;
        iC--;
        index++;
      }
    } else if (degA < degB) {
      alignedA[index] = scaleA.data[indexA];
      indexA++;
      index++;
    } else {
      alignedB[index] = newB.data[indexB];
      indexB++;
      index++;
    }
  }

  // Remove the shift from B to return to the original alignment.
  for (let i = 0; i < alignedB.length; i++) {
    if (alignedB[i] != null) {
      alignedB[i] = alignedB[i]! - shifting;
    }
  }

  return [alignedA, alignedB];
}

/**
 * Finds the name of a scale based on a predefined pool of scales.
 * If the exact scale is not found, it returns the closest match with variations (e.g., #4 or b6).
 *
 * @param {positionVector} scaleInput - The input scale to analyze.
 * @returns {string} - The name of the closest scale and any variations.
 */
function findScaleName(scaleInput: positionVector): string {
  const rootNote = scaleNames(scaleInput)[0]!;

  // Normalize the input scale.
  const normalizedInput = scaleInput.toZero();

  // Prepare the pool of scales for comparison.
  const pool = scalePool.map((s) => ({
    ...s,
    degrees: new positionVector(s.degrees, 12, 12),
  }));

  let closestScale = { name: "", degrees: new positionVector([], 12, 12) };
  let minDistance = Infinity;
  let variationLabels: string[] = [];
  let bestBaseMatch = -Infinity;

  for (const poolScale of pool) {
    const [alignedInput, alignedReference] = alignScales(normalizedInput, poolScale.degrees);

    let distance = 0;
    let baseMatch = 0;

    for (let i = 0; i < alignedInput.length; i++) {
      const inputDegree = alignedInput[i];
      const referenceDegree = alignedReference[i];

      if (inputDegree !== null && referenceDegree !== null) {
        if ([0, 2, 4, 6].includes(i) && inputDegree === referenceDegree) {
          baseMatch++;
        }
        distance += Math.abs(inputDegree - referenceDegree);
      } else if (inputDegree !== null || referenceDegree !== null) {
        distance += 1;
      }
    }

    if (baseMatch > bestBaseMatch || (baseMatch === bestBaseMatch && distance < minDistance)) {
      bestBaseMatch = baseMatch;
      minDistance = distance;
      closestScale = poolScale;

      const filledInput = new positionVector([], scaleInput.modulo, scaleInput.modulo);

      for (let i = 0; i < alignedInput.length; i++) {
        if (alignedInput[i] !== null) {
          filledInput.data.push(alignedInput[i]!);
        } else {
          filledInput.data.push(alignedReference[i]!);
        }
      }

      const degrees = filledInput.getDegrees();
      variationLabels = [];

      for (let i = 0; i < alignedInput.length; i++) {
        const inputDegree = alignedInput[i];
        const referenceDegree = alignedReference[i];
        const degreeRef = degrees[i]!;

        if (referenceDegree === null && inputDegree !== null) {
          const diff = inputDegree - [0, 2, 4, 5, 7, 9, 11][degreeRef]!;
          if (diff === 1) {
            variationLabels.push(`add#${degreeRef + 1}`);
          } else if (diff === -1) {
            variationLabels.push(`addb${degreeRef + 1}`);
          } else {
            variationLabels.push(`add${degreeRef + 1}`);
          }
        } else if (inputDegree === null && referenceDegree !== null) {
          variationLabels.push(`no${degreeRef + 1}`);
        } else if (inputDegree !== null && referenceDegree !== null && inputDegree !== referenceDegree) {
          const diff = inputDegree - referenceDegree;
          const label =
            diff === 1 ? `#${degreeRef + 1}` : diff === -1 ? `b${degreeRef + 1}` : null;
          if (label) {
            variationLabels.push(label);
          }
        }
      }
    }
  }

  const variationText = variationLabels.length > 0 ? ` ${variationLabels.join(" ")}` : "";
  return `${rootNote} ${closestScale.name}${variationText}`;
}
