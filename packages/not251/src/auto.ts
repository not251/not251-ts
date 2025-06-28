import { positionVector } from "./positionVector";
import { intervalVector } from "./intervalVector";
import {
  euclideanDistanceMap,
  minRotation,
  sortByDistance,
  optionMatrix,
  editDistance,
  distanceMap,
} from "./distances";
import { toIntervals, toPositions, selectFromInterval } from "./crossOperation";
import { findPC, scaleMap, modulo } from "./utility";
import { autoVoicing, ChordParams } from "./chord"; // Importa autoVoicing e ChordParams

/**
 * Represents an element in the auto grado map, which stores different voicing results for a given scale.
 * Includes scale, result position vector, grado (degree), and distance.
 */
export type autoGradoMapElement = {
  scale: positionVector;
  result: positionVector;
  grado: number;
  distance: number;
};

/**
 * An array of autoGradoMapElement objects, providing a collection of voicing results across scales and degrees.
 * Useful for finding the best voicing match for a given target.
 */
export type autoGradoMap = autoGradoMapElement[];

/**
 * Generates a map of voicing options for a scale, considering different degrees and target positions.
 * Returns an array of autoGradoMap elements, each with voicing results and distance information.
 *
 * @param scalaMap An array of positionVectors representing multiple scales to be analyzed.
 * @param grado The degree of the scale to be considered in voicing.
 * @param voicing The intervalVector representing the voicing intervals.
 * @param target The ChordParams representing the target voicing configuration to be matched.
 * @returns An array of autoGradoMap objects, each containing a scale, result, degree, and distance.
 */
export function autoGradoGO(
  scalaMap: positionVector[],
  grado: number,
  voicing: intervalVector,
  target: ChordParams // Mantenuto ChordParams come richiesto
): autoGradoMap {
  let voicingMap: autoGradoMap = [];

  // Corretto: Usa < invece di &lt;
  for (let j = 0; j < scalaMap.length; ++j) {
    voicing.offset = grado;
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < voicing.data.length; ++i) {
      // Correzione: Assicurati che scalaMap[j] non sia undefined prima di usarlo
      const currentScale = scalaMap[j];
      if (!currentScale) continue; // Salta se la scala corrente non è definita

      let v: positionVector = selectFromInterval(currentScale, voicing);

      // Crea un ChordParams di riferimento basato sulla scala 'v'
      const refParams: ChordParams = { scala: v };

      // Chiama autoVoicing con i parametri corretti
      let autovoicedResult: ChordParams = autoVoicing(refParams, target);

      // Correzione: Usa ?? per fornire valori di fallback se le proprietà sono undefined
      voicingMap.push({
        scale: currentScale,
        result: autovoicedResult.scala ?? new positionVector([]), // Usa fallback
        grado: voicing.offset,
        distance: autovoicedResult.distance ?? Infinity, // Usa fallback (Infinity per assicurare che non sia il migliore se fallisce)
      });

      // Correzione: Usa l'asserzione non-null (!) perché 'i' è entro i limiti dell'array 'voicing.data'.
      const intervalValue = voicing.data[i]!;
      voicing.offset -= intervalValue;
    }
  }

  return voicingMap;
}

/**
 * Finds the best voicing match for a given degree in a scale map.
 * Sorts by distance and returns the closest match as an autoGradoMapElement object.
 *
 * @param scalaMap An array of positionVectors representing multiple scales to be analyzed.
 * @param grado The degree of the scale to be considered in voicing.
 * @param voicing The intervalVector representing the voicing intervals.
 * @param target The ChordParams representing the target voicing configuration to be matched.
 * @returns The closest matching autoGradoMapElement based on distance, or undefined if the map is empty.
 */
export function autoGrado(
  scalaMap: positionVector[],
  grado: number,
  voicing: intervalVector,
  target: ChordParams
): autoGradoMapElement | undefined { // Modificato il tipo di ritorno per gestire il caso di mappa vuota

  let map = autoGradoGO(scalaMap, grado, voicing, target);

  if (map.length === 0) {
    return undefined; // Nessun risultato trovato
  }

  // Corretto: Usa => invece di =&gt;
  map = map.sort((a, b) => a.distance - b.distance);

  // Correzione: map[0] potrebbe essere undefined se la mappa è vuota, gestito sopra.
  return map[0]!;
}

/**
 * !!! WIP!
 * Class for managing and updating two consecutive position vectors, used in auto voicing.
 * Allows for comparison between current and previous states of position vectors.
 */
class autoVoicingCouple {
  private a: positionVector;
  private b: positionVector;

  constructor() {
    // Inizializza con valori validi ma vuoti
    this.a = new positionVector([], 1, 1);
    this.b = new positionVector([], 1, 1);
  }

  /**
   * @param input The new position vector to update.
   * @returns void
   */
  update(input: positionVector): void {
    this.a = this.b; // 'a' prende il valore precedente di 'b'
    // Crea una *nuova* istanza per 'b' per evitare modifiche per riferimento
    this.b = new positionVector([...input.data], input.modulo, input.span);
  }

  /**
   * Retrieves the current state of the two position vectors.
   *
   * @returns An object containing the first and second position vectors.
   */
  get(): { first: positionVector; second: positionVector } {
    return {
      first: this.a,
      second: this.b,
    };
  }
}

/**
 * Updates the auto voicing process with a new position vector and optional auto flag.
 * Returns the updated position vector, inversion position, and distance, or the previous vector if auto is off.
 *
 * @param input The position vector to update for auto voicing.
 * @param isAuto A boolean indicating whether the auto voicing feature is enabled.
 * @returns A tuple containing the updated position vector, inversion position, and distance.
 */
function autoVoicingUpdate(
  input: positionVector,
  isAuto: boolean
): [positionVector, number, number] {
  // Nota: Questa classe sembra creare una nuova istanza ad ogni chiamata,
  // perdendo lo stato precedente. Potrebbe essere necessario gestirla esternamente.
  let coppia = new autoVoicingCouple();
  coppia.update(input); // Aggiorna 'b' con input, 'a' diventa il precedente 'b' (inizialmente vuoto)
  let vectors = coppia.get();
  let v1: positionVector = vectors.first;
  let v2: positionVector = vectors.second; // v2 è ora una copia di 'input'

  // Se v1 è ancora il vettore vuoto iniziale, usa v2 come riferimento
  if (v1.data.length === 0) {
    v1 = v2;
  }

  // Crea oggetti ChordParams
  const refParams: ChordParams = { scala: v1 };
  const targetParams: ChordParams = { scala: v2 };

  // Chiama autoVoicing
  let autoVoicingResult: ChordParams = autoVoicing(refParams, targetParams);

  // Accedi alle proprietà con fallback
  let voiced: positionVector = autoVoicingResult.scala ?? v2; // Fallback a v2
  let position: number = autoVoicingResult.position ?? 0; // Fallback a 0
  let distance: number = autoVoicingResult.distance ?? 0; // Fallback a 0

  if (isAuto) {
    // Aggiorna la coppia con il risultato del voicing se 'isAuto' è true
    // (Attenzione: la prossima chiamata a autoVoicingUpdate creerà una nuova coppia)
    coppia.update(voiced);
    return [voiced, position, distance];
  } else {
    // Se 'isAuto' è false, restituisci il vettore di input originale (v2)
    return [v2, 0, 0];
  }
}

type AutoRootMapElement = {
  root: number;
  scale: positionVector;
};

/**
 * Creates potential scale variations based on a reference scale and a target note vector.
 * Each variation shifts the reference scale so that one of its notes aligns with the first note of the target vector.
 * Filters the results to keep only scales that contain all notes from the target vector (modulo equivalence).
 *
 * @param note - The target positionVector (containing notes to match).
 * @param scale - The reference positionVector (scale).
 * @returns An array of AutoRootMapElement, each containing a potential root and the corresponding shifted scale.
 */
function scalaMapFromNote(
  note: positionVector,
  scale: positionVector
): AutoRootMapElement[] {
  let resultArray: positionVector[] = [];
  // Assicurati che scale sia definito e abbia dati
  if (!scale || scale.data.length === 0) return [];
  // Assicurati che note sia definito e abbia dati
  if (!note || note.data.length === 0) return [];

  // Correzione: Usa l'asserzione non-null (!) se sei sicuro che note.data[0] esista
  const firstNote = note.data[0]!;

  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < scale.data.length; i++) {
    // Correzione: Usa l'asserzione non-null (!) se sei sicuro che scale.data[i] esista
    const scaleNote = scale.data[i]!;
    let value = scale.sum(firstNote - scaleNote);
    resultArray.push(value);
  }

  // Corretto: Usa => invece di =&gt; per le funzioni freccia
  resultArray = resultArray.filter((value) =>
    note.data.every((noteValue) => // noteValue è number | undefined
      value.data.some(
        (valueData) => // valueData è number | undefined
          // Correzione: Controlla che noteValue e valueData non siano undefined prima del modulo
          noteValue !== undefined && valueData !== undefined &&
          modulo(valueData, scale.modulo) === modulo(noteValue, scale.modulo)
      )
    )
  );

  // Corretto: Usa => invece di =&gt;
  let resultObjects: AutoRootMapElement[] = resultArray.map((scaleResult) => {
    // Correzione: Assicurati che scaleResult.data[0] esista prima di usarlo
    const firstScaleData = scaleResult.data[0];
    return {
      root: firstScaleData !== undefined ? modulo(firstScaleData, scaleResult.modulo) : -1, // Usa un valore di fallback se undefined
      scale: scaleResult,
    };
  }).filter(item => item.root !== -1); // Filtra eventuali elementi con root -1

  return resultObjects;
}

/**
 * Normalizes and sorts the data within each scale of an AutoRootMapElement array.
 * Applies modulo operation to each element and then sorts the data array.
 *
 * @param scalaMap - An array of AutoRootMapElement.
 * @returns A new array of AutoRootMapElement with normalized and sorted scale data.
 */
function sortAndModuloScalaMap(
  scalaMap: AutoRootMapElement[]
): AutoRootMapElement[] {
  // Corretto: Usa => invece di =&gt;
  return scalaMap.map(({ root, scale }) => {
    // Corretto: Usa => invece di =&gt;
    const moduloData = scale.data.map((value) =>
        // Correzione: Controlla che value non sia undefined
        value !== undefined ? modulo(value, scale.modulo) : undefined
    ).filter((v): v is number => v !== undefined); // Filtra via gli undefined e asserisci il tipo number

    // Corretto: Usa => invece di =&gt;
    const sortedData = moduloData.sort((a, b) => a - b);

    return {
      root: root,
      scale: new positionVector(sortedData, scale.modulo, scale.span),
    };
  });
}

/**
 * WIP! New version coming!
 * Automatically determines the root position of a scale that best matches a set of notes.
 * Uses edit distance to find the closest match and returns the root position.
 *
 * @param scale - The positionVector containing the scale to be analyzed.
 * @param notes - An array of numbers representing the notes to be targeted.
 * @returns The best matching root position or -666 if no match is found.
 */
export function autoRoot(scale: positionVector, notes: number[]): number {
  // Assicurati che scale e notes non siano vuoti
  if (!scale || scale.data.length === 0 || !notes || notes.length === 0) {
    return -666;
  }

  let result = scaleMap(scale.data, scale.modulo);
  let foundMap = findPC(result, scale.modulo, notes);

  if (Object.keys(foundMap).length === 0) {
    return -666;
  }

  let minDistance = Number.MAX_VALUE;
  let root = -1;

  for (const key in foundMap) {
    // Buona pratica: usare hasOwnProperty
    if (Object.prototype.hasOwnProperty.call(foundMap, key)) {
      let value = foundMap[key]; // value è number[] | undefined

      // Correzione: Controlla se 'value' è definito
      if (value) {
        let distance = editDistance(value, scale.data);
        // Corretto: Usa < invece di &lt;
        if (distance < minDistance) {
          minDistance = distance;
          root = parseInt(key, 10); // Specifica la base 10 per parseInt
        }
      }
    }
  }

  return root;
}

/*
WIP!
Update tests!!!!

// Questa versione alternativa sembra incompleta o commentata apposta.
// La lascio commentata come nell'originale.

export function autoRoot(
  scale: positionVector,
  notes: positionVector
): number | undefined {
  let result = scalaMapFromNote(scale, notes); // Qui scale e notes sono invertiti rispetto alla firma?
  let sorted = sortAndModuloScalaMap(result);

  if (Object.keys(sorted).length == 0) {
    return undefined;
  }

  let minDistance = Number.MAX_VALUE;
  let root = -1; // Inizializza a -1

  // Itera sull'array 'sorted' invece che sull'oggetto originale 'result'
  for (let i = 0; i < sorted.length; i++) {
    let value = sorted[i]; // value è AutoRootMapElement | undefined
    if (value && value.scale) { // Controlla che value e value.scale siano definiti
      // Calcola la distanza tra la scala ordinata e la scala originale
      let distance = editDistance(value.scale.data, scale.data);
      if (distance < minDistance) {
        minDistance = distance;
        root = value.root; // Assegna la root dall'elemento corrente
      }
    }
  }

  // Restituisci root solo se è stato trovato un valore valido (diverso da -1)
  return root !== -1 ? root : undefined;
}
*/
