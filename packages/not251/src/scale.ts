import { intervalVector } from "./intervalVector";
import { positionVector }  from "./positionVector";
import { toIntervals, toPositions } from "./crossOperation";
import { euclideanDistanceMap, minRotation, sortByDistance, optionMatrix, distanceMapElement } from "./distances"; // Aggiunto optionMatrix e distanceMapElement
import { modulo } from "./utility";

export type ScaleParams = {
  intervals?: intervalVector;
  root?: number;
  modo?: number;
  grado?: number;
  isInvert?: boolean;
  isMirror?: boolean;
  mirrorPos?: number;
  mirrorLeft?: boolean;
};

export const defaultScaleParams: ScaleParams = {
  intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
  root: 0,
  modo: 0,
  grado: 0,
  isInvert: false,
  isMirror: false,
  mirrorPos: 0,
  mirrorLeft: false,
} as const;

/**
 * Generates a positionVector based on an input intervalVector, allowing for transformations like inversion and mirroring.
 * It rotates the interval vector by modo, adjusts the root, and optionally inverts or mirrors it.
 * The output is then converted to a position vector, which is roto-translated by grado to finalize its configuration.
 *
 * @param intervals - The base intervals that define the scale.
 * @param root - Starting pitch or offset for the scale (default is 0).
 * @param modo - Rotation step to define the starting position of the scale (default is 0).
 * @param grado - Degree of roto-translation applied to the final scale (default is 0).
 * @param isInvert - If true, the scale is inverted (default is false).
 * @param isMirror - If true, a mirroring operation is applied (default is false).
 * @param mirrorPos - Position at which the mirroring occurs (default is 0).
 * @param mirrorLeft - Determines the mirroring direction (left or right) (default is false).
 * @returns The resulting positionVector after applying the transformations.
 */
export function scale({
  intervals = new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
  root = 0,
  modo = 0,
  grado = 0,
  isInvert = false,
  isMirror = false,
  mirrorPos = 0,
  mirrorLeft = false,
}: ScaleParams = defaultScaleParams): positionVector {
  // Crea una copia per non modificare l'originale
  let workingIntervals = new intervalVector([...intervals.data], intervals.modulo, intervals.offset);
  workingIntervals.offset = root;
  let out: intervalVector = workingIntervals.rotate(modo, workingIntervals.data.length, false); // Usa false per non modificare workingIntervals
  if (isInvert) out = out.invert(false); // Usa false
  if (isMirror) out = out.singleMirror(mirrorPos, mirrorLeft, false); // Usa false
  let outPos: positionVector = toPositions(out);
  outPos.spanUpdate();
  outPos.rototranslate(grado); // Questo modifica outPos
  return outPos;
}

/**
 * Defines the structure for a single mode entry, including the rotation index and a position vector.
 * This structure facilitates storing multiple modal variations of a scale, each represented by its own rotation.
 */
type modeMapElement = {
  rotation: number;
  data: positionVector;
};

/**
 * An array of modeMapElement objects, serving as a collection for multiple modes of a scale.
 * Allows for easy iteration and mode selection based on rotation.
 */
type modeMap = modeMapElement[];

/**
 * Returns a map of modeMap elements with rotation indexes and position vectors.
 * Generates all possible modes for a given interval vector scale by rotating it.
 *
 * @param scaleInput The intervalVector containing the scale to be analyzed.
 * @returns A modeMap containing the generated modes with their respective rotations.
 */
export function autoModeGO(scaleInput: intervalVector): modeMap {
  let out: modeMap = [];
  let max = scaleInput.data.length;

  // Corretto: Usa < invece di &lt;
  for (let r = 0; r < max; r++) {
    let option: modeMapElement = {
      rotation: 0,
      // Inizializza con un positionVector vuoto valido
      data: new positionVector([], scaleInput.modulo, scaleInput.modulo),
    };
    // Usa 'false' per non modificare l'originale scaleInput
    let rotated = scaleInput.rotate(r, max, false);
    option.data = toPositions(rotated);
    option.rotation = r;
    out.push(option);
  }

  return out;
}

/**
 * Analyzes a set of modes and compares them to a given set of notes.
 *
 * The function has two modes of operation controlled by the `findBest` parameter:
 *
 * - When `findBest` is `false` (default):
 *   - Returns only the modes that match **all** the given notes.
 *   - Useful for identifying exact matches.
 *
 * - When `findBest` is `true`:
 *   - Returns all modes, including partial matches, ranked by the number of matching notes.
 *   - Includes additional metadata such as the indices of matched notes and the total match count for each mode.
 *
 * @param modes - A list of modes (modeMap) to analyze.
 * @param notes - A positionVector representing the set of notes to compare against.
 * @param findBest - If `true`, returns all modes ranked by match count. If `false`, returns only modes that match all notes (default is `false`).
 * @returns
 *   - If `findBest` is `false`: An array of modes that match all notes, each with `rotation` and `data`.
 *   - If `findBest` is `true`: An array of all modes, sorted by match count, each with `rotation`, `data`, `matchedIndices`, and `matchCount`.
 */
export function autoModeOptions(
  modes: modeMap,
  notes: positionVector,
  findBest: boolean = false
):
  | {
      rotation: number;
      data: number[];
    }[]
  | {
      rotation: number;
      data: number[];
      matchedIndices: number[];
      matchCount: number;
    }[] {
  if (findBest) {
    // Return all modes, ordered by the number of matches
    let result: {
      rotation: number;
      data: number[];
      matchedIndices: number[];
      matchCount: number;
    }[] = [];

    for (let mode of modes) {
      let matchedIndices: number[] = [];
      let modePositions = mode.data.data; // Questo è number[] | undefined[]

      // Collect indices of matched notes
      // Corretto: Usa < invece di &lt;
      for (let noteIndex = 0; noteIndex < notes.data.length; noteIndex++) {
        let note = notes.data[noteIndex]; // note è number | undefined
        // FIX: Aggiunto controllo per note != null (TS2345)
        if (note != null) {
            for (let modeNote of modePositions) { // modeNote è number | undefined
                // Correzione: Controlla che modeNote non sia undefined prima del modulo
                if (modeNote != null && modulo(note, notes.modulo) === modulo(modeNote, notes.modulo)) {
                    matchedIndices.push(noteIndex);
                    break;
                }
            }
        }
      }

      // Add mode to result with match information
      result.push({
        rotation: mode.rotation,
        // Filtra undefined da modePositions prima di assegnare
        data: modePositions.filter((v): v is number => v !== undefined),
        matchedIndices,
        matchCount: matchedIndices.length,
      });
    }

    // Sort by match count in descending order
    // Corretto: Usa => invece di =&gt;
    result.sort((a, b) => b.matchCount - a.matchCount);

    return result;
  } else {
    // Return only modes that match all notes
    let out: {
      rotation: number;
      data: number[];
    }[] = [];

    for (let mode of modes) {
      let allNotesFound = true;
      let modePositions = mode.data.data; // number[] | undefined[]

      // Corretto: Usa < invece di &lt;
      for (let i = 0; i < notes.data.length; i++) {
        let note = notes.data[i]; // number | undefined
        let found = false;

        // Correzione: Controlla che 'note' non sia undefined
        if (note != null) {
            for (let modeNote of modePositions) { // number | undefined
                // Correzione: Controlla che 'modeNote' non sia undefined
                if (modeNote != null && modulo(note, notes.modulo) === modulo(modeNote, notes.modulo)) {
                    found = true;
                    break;
                }
            }
        } else {
            // Se la nota originale è undefined, non può essere trovata
            found = false;
        }


        if (!found) {
          allNotesFound = false;
          break;
        }
      }

      if (allNotesFound) {
        // Filtra undefined da modePositions prima di assegnare
        out.push({ rotation: mode.rotation, data: modePositions.filter((v): v is number => v !== undefined) });
      }
    }

    return out;
  }
}

/**
 * !!! simplify!!!
 *
 * Returns the best match as an object with rotation and position vector data.
 * Automatically finds the best fitting mode for a given set of notes and interval vector scale.
 *
 * @param scaleIntervals The intervalVector containing the scale intervals to be analyzed.
 * @param notes The positionVector containing the notes to be targeted.
 * @returns An object containing the rotation and the best fitting position vector data.
 */
function autoMode_internal(
  scaleIntervals: intervalVector,
  notes: positionVector
): { rotation: number; data: positionVector } {
  let mod = scaleIntervals.modulo;
  let root = scaleIntervals.offset;

  // Crea una copia di notes per non modificarlo
  let notesCopy = new positionVector([...notes.data], notes.modulo, notes.span);

  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < notesCopy.data.length; i++) {
    // FIX: Aggiunto controllo per notesCopy.data[i] != null (TS2532)
    const noteVal = notesCopy.data[i];
    if (noteVal != null) {
        notesCopy.data[i] = noteVal - root;
    }
  }

  let modes = autoModeGO(scaleIntervals);
  // Chiama autoModeOptions con findBest=false per ottenere solo match completi o findBest=true per ottenere tutti i match ordinati
  let options = autoModeOptions(modes, notesCopy, false); // O true se vuoi il migliore anche se parziale

  // Gestisci il caso in cui options sia vuoto
  if (options.length === 0) {
    // Se findBest=false non ha trovato match completi, prova con findBest=true
    options = autoModeOptions(modes, notesCopy, true);
    if (options.length === 0) {
        // Se anche findBest=true non trova nulla (improbabile ma sicuro)
        //console.warn("autoMode_internal: No modes found or matched.");
        let scala = toPositions(scaleIntervals);
        return { data: scala, rotation: -666 }; // Ritorna un valore indicativo di errore
    }
    // Se findBest=true ha trovato qualcosa, useremo il primo (il migliore parziale)
    //console.warn("autoMode_internal: No exact mode match found. Using best partial match.");
  }

  let scalePositions = toPositions(scaleIntervals);

  // Assicurati che options sia del tipo corretto per euclideanDistanceMap
  // Se findBest=false, options è { rotation: number; data: number[] }[]
  // Se findBest=true, options è { rotation: number; data: number[]; matchedIndices: number[]; matchCount: number }[]
  // euclideanDistanceMap si aspetta optionMatrix, che può essere optionMatrixElement[]
  // Quindi, mappiamo 'options' per adattarlo a optionMatrixElement[]
  const matrixForDistance: { rotation: number; data: number[] }[] = options.map(opt => ({
      rotation: opt.rotation,
      data: opt.data // opt.data è già number[] grazie alle correzioni in autoModeOptions
  }));


  let distanceMap = euclideanDistanceMap(matrixForDistance, scalePositions.data.filter((v): v is number => v !== undefined)); // Filtra undefined da scalePositions.data

  // Gestisci il caso in cui distanceMap sia vuoto
  if (distanceMap.length === 0) {
      //console.warn("autoMode_internal: Could not calculate distances.");
      let scala = toPositions(scaleIntervals);
      return { data: scala, rotation: -666 };
  }

  let sorteddistances = sortByDistance(distanceMap);

  // FIX: Controlla che sorteddistances non sia vuoto prima di accedere a [0] (TS2532)
  const bestMatch: distanceMapElement | undefined = sorteddistances[0];

  if (!bestMatch) {
      //console.warn("autoMode_internal: sorteddistances was empty.");
      let scala = toPositions(scaleIntervals);
      return { data: scala, rotation: -666 };
  }

  let r = bestMatch.rotation;
  let bestOptionData = bestMatch.data; // Questo è number[]

  // Assicurati che bestOptionData sia un array di numeri valido
  if (!Array.isArray(bestOptionData)) {
      //console.warn("autoMode_internal: Best match data is not an array.");
      bestOptionData = []; // Fallback a array vuoto
  }


  let p = new positionVector(
    bestOptionData, // Ora è sicuramente number[]
    scalePositions.modulo,
    scalePositions.span
  );
  let autoModeIntervals = toIntervals(p);

  autoModeIntervals.offset = root; // Reimposta l'offset originale

  let mode = toPositions(autoModeIntervals);

  return {
    data: mode,
    rotation: r,
  };
}

/**
 *
 * @param inputScaleParams input scale parameters
 * @param notes notes to find right mode for
 * @returns new scale parameters
 */
export function autoMode(
  inputScaleParams: ScaleParams,
  notes: positionVector
): ScaleParams {
  // Assicurati che intervals sia definito
  const intervals = inputScaleParams.intervals;
  if (!intervals) {
      //console.error("autoMode: inputScaleParams.intervals is undefined.");
      return inputScaleParams; // Restituisci i parametri originali o lancia un errore
  }

  let result = autoMode_internal(
    intervals, // Passa intervals direttamente
    notes
  );
  // Crea una copia per non modificare l'originale
  let outputScaleParams = { ...inputScaleParams };
  outputScaleParams.modo = result.rotation;
  // Potresti voler aggiornare anche gli intervalli se autoMode_internal li modifica strutturalmente
  // outputScaleParams.intervals = toIntervals(result.data); // Esempio se necessario
  return outputScaleParams;
}
