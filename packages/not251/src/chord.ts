import { positionVector, inverse_select, lcmPosition } from "./positionVector";
import { intervalVector } from "./intervalVector";
import { selectFromInterval } from "./crossOperation";
import { scale } from "./scale";
import {
  euclideanDistanceMap,
  minRotation,
  optionMatrix, optionMatrixElement, // Assicurati che optionMatrix sia definito correttamente in distances.ts
  sortByDistance,
} from "./distances";
import { modulo } from "./utility";

export type ChordParams = {
  scala?: positionVector;
  selection?: positionVector | intervalVector;
  grado?: number;
  preVoices?: number;
  position?: number;
  postVoices?: number;
  root?: number;
  octave?: number;
  isInvert?: boolean;
  isNegative?: boolean;
  negativePos?: number;
  standardNegative?: boolean;
  distance?: number; // Aggiunto per coerenza con autoVoicingResult
};

export const defaultChordParams: ChordParams = {
  scala: scale(),
  grado: 0,
  selection: new intervalVector([2], 12, 0),
  preVoices: 3,
  position: 0,
  postVoices: 3,
  isInvert: false,
  isNegative: false,
  negativePos: 10,
  standardNegative: true,
  root: 0,
  octave: 5,
  distance: 0,
} as const;

/**
 * Generates chords from intervals or positions depending on parameters.
 * @param params ChordParams
 * @returns A positionVector representing the generated chord.
 */
export function chord({
  scala = scale(),
  grado = 0,
  selection = new intervalVector([2], 12, 0),
  preVoices = 3,
  position = 0,
  postVoices = 3,
  isInvert = false,
  isNegative = false,
  negativePos = 10,
  standardNegative = true,
  root = 0,
  octave = 5,
}: ChordParams = defaultChordParams): positionVector { // Aggiunto tipo di ritorno esplicito
  if (selection instanceof positionVector) {
    return chordFromPosition(
      scala,
      grado,
      selection, // Non serve più il cast 'as positionVector'
      preVoices,
      position,
      postVoices,
      isInvert,
      isNegative,
      negativePos,
      standardNegative,
      root,
      octave
    );
  } else {
    return chordFromInterval(
      scala,
      grado,
      selection, // Non serve più il cast 'as intervalVector'
      preVoices,
      position,
      postVoices,
      isInvert,
      isNegative,
      negativePos,
      standardNegative,
      root,
      octave
    );
  }
}

/**
 * Generates a chord by selecting positions from a scale and applying transformations,
 * including inversion and negation. This function uses a positionVector scale and selection
 * to produce a position vector chord.
 *
 * @param scala - The scale represented as a positionVector.
 * @param grado - Degree of rotation to change the starting note of the scale (default is 0).
 * @param selection - Determines which positions in the scale are included in the chord.
 * @param preVoices - Number of voices to consider before the selection (default is 3).
 * @param position - Degree of roto-translation applied to the selected chord (default is 0).
 * @param postVoices - Number of voices to consider after the selection (default is 3).
 * @param isInvert - If true, the chord is inverted (default is false).
 * @param isNegative - If true, the chord undergoes a negative transformation (default is false).
 * @param negativePos - Position for the negative operation (default is 10).
 * @param standardNegative - Defines the type of negative applied (default is true).
 * @param root - Adjusts the root note of the resulting chord (default is 0).
 * @param octave - Adjusts the octave of the resulting chord (default is 4).
 * @returns The resulting positionVector chord after applying transformations.
 */
function chordFromPosition(
  scala: positionVector = scale(),
  grado: number = 0,
  selection: positionVector,
  preVoices: number = 3,
  position: number = 0,
  postVoices: number = 3,
  isInvert: boolean = false,
  isNegative: boolean = false,
  negativePos: number = 10,
  standardNegative: boolean = true,
  root: number = 0,
  octave: number = 4
): positionVector {
  let octaves = octave * scala.modulo;
  let shiftedRoot = root + octaves;
  // Assumiamo che rototranslate restituisca una nuova istanza o modifichi una copia
  let scalePositions: positionVector = scala.rototranslate(grado, scala.data.length, false); // Usiamo false per non modificare l'originale
  // Assumiamo che rototranslate restituisca una nuova istanza o modifichi una copia
  let selectionCopy = new positionVector([...selection.data], selection.modulo, selection.span);
  selectionCopy.rototranslate(0, preVoices); // Modifica la copia

  let out: positionVector = scalePositions.selectFromPosition(selectionCopy);
  out.rototranslate(position, postVoices); // Modifica 'out'
  out.spanUpdate();
  if (isInvert) out = out.invert(false); // Usa false per ottenere una nuova istanza
  if (isNegative) out = out.negative(negativePos, standardNegative, false); // Usa false per ottenere una nuova istanza

  // Crea una nuova istanza per il risultato finale
  let finalData = out.data.map(val => val !== undefined ? val + shiftedRoot : undefined)
                         .filter((v): v is number => v !== undefined); // Filtra undefined

  return new positionVector(finalData, out.modulo, out.span);
}

/**
 * Constructs a chord using intervals rather than positions for the selection process.
 * It applies rotation, inversion, and negation to the generated position vector based
 * on the provided scale.
 *
 * @param scala - The scale as a positionVector.
 * @param grado - Degree of rotation to change the starting note (default is 0).
 * @param selection - Intervals that define which positions in the scale are selected.
 * @param preVoices - Number of voices considered before the selection (default is 3).
 * @param position - Degree of roto-translation applied to the selected chord (default is 0).
 * @param postVoices - Number of voices considered after the selection (default is 3).
 * @param isInvert - If true, the chord is inverted (default is false).
 * @param isNegative - If true, the chord undergoes a negative transformation (default is false).
 * @param negativePos - Position for negative (default is 10).
 * @param standardNegative - Specifies the type of negative applied (default is true).
 * @param root - Adjusts the root note of the chord (default is 0).
 * @param octave - Adjusts the octave of the chord (default is 4).
 * @returns The resulting positionVector chord after applying transformations.
 */
function chordFromInterval(
  scala: positionVector = scale(),
  grado: number = 0,
  selection: intervalVector,
  preVoices: number = 3,
  position: number = 0,
  postVoices: number = 3,
  isInvert: boolean = false,
  isNegative: boolean = false,
  negativePos: number = 10,
  standardNegative: boolean = true,
  root: number = 0,
  octave: number = 4
): positionVector {
  let octaves = octave * scala.modulo;
  let shiftedRoot = root + octaves;
  // Crea una copia di selection per non modificare l'originale
  let selectionCopy = new intervalVector([...selection.data], selection.modulo, selection.offset);
  selectionCopy.rotate(0, preVoices); // Modifica la copia
  selectionCopy.offset = grado;

  let out: positionVector = selectFromInterval(scala, selectionCopy);
  out.rototranslate(position, postVoices); // Modifica 'out'
  out.spanUpdate();
  if (isInvert) out = out.invert(false); // Usa false per ottenere una nuova istanza
  if (isNegative) out = out.negative(negativePos, standardNegative, false); // Usa false per ottenere una nuova istanza

  // Crea una nuova istanza per il risultato finale
  let finalData = out.data.map(val => val !== undefined ? val + shiftedRoot : undefined)
                         .filter((v): v is number => v !== undefined); // Filtra undefined

  return new positionVector(finalData, out.modulo, out.span);
}

export function autoVoicing(
  reference: ChordParams,
  target: ChordParams
): ChordParams {
  let output = { ...target };
  // Assicurati che 'chord' restituisca sempre un positionVector valido
  const referenceChord = chord({ ...reference });
  const targetChord = chord({ ...target });

  // Verifica che i chord non siano vuoti o invalidi prima di procedere
  if (referenceChord.data.length === 0 || targetChord.data.length === 0) {
      ////console.warn("autoVoicing: Reference or target chord is empty.");
      // Restituisci target o un valore di default sensato
      return target;
  }

  let result = autoVoicing_internal(referenceChord, targetChord);
  output.position = result.inversion;
  // Potresti voler aggiornare anche output.scala con result.pv se è l'intenzione
  // output.scala = result.pv;
  output.distance = result.distance; // Aggiorna anche la distanza

  return output;
}

/**
 * Adjusts the target position vector to match the reference vector by finding the optimal rotation.
 * Evaluates possible rotations and calculates the Euclidean distance to determine the best alignment.
 * Returns an object containing the modified position vector, the applied rotation (inversion), and the distance between the two vectors.
 *
 * @param reference The reference position vector to be matched.
 * @param target The target position vector to be adjusted.
 * @returns An object containing the adjusted position vector, the applied rotation, and the distance between the two vectors.
 */
function autoVoicing_internal(
  reference: positionVector,
  target: positionVector
): { pv: positionVector; inversion: number; distance: number } {
  reference.spanUpdate();
  target.spanUpdate();

  // Assicurati che reference e target non siano vuoti
  if (reference.data.length === 0 || target.data.length === 0) {
      //console.warn("autoVoicing_internal: Reference or target vector is empty.");
      return { pv: target, inversion: 0, distance: Infinity }; // Ritorna un valore di default
  }

  let center = minRotation(reference, target);

  let options = target.options(center); // options è positionVector[]

// In chord.ts, dentro la funzione autoVoicing_internal:

// Specifica esplicitamente il tipo di matrix
let matrix: optionMatrixElement[] = []; // Rimozione di questo commento
// ... resto del codice ...
for (let i = 0; i < options.length; ++i) {
  const option = options[i];
  if (option && option.data) {
    matrix.push({ // Ora questo corrisponde al tipo esplicito di matrix
      rotation: center - target.data.length + i,
      data: option.data,
    });
  }
}


  // Verifica che matrix non sia vuota
  if (matrix.length === 0) {
      //console.warn("autoVoicing_internal: No valid options generated.");
      return { pv: target, inversion: 0, distance: Infinity };
  }

  let distances_map = euclideanDistanceMap(matrix, reference.data);
  let sorteddistances = sortByDistance(distances_map);

  // Correzione: Controlla che sorteddistances non sia vuoto
  if (sorteddistances.length === 0) {
      //console.warn("autoVoicing_internal: No distances calculated.");
      return { pv: target, inversion: 0, distance: Infinity };
  }

  // Correzione: Usa l'asserzione non-null (!) solo dopo aver verificato che l'array non è vuoto
  const bestMatch = sorteddistances[0]!;
  let r = bestMatch.rotation;
  let firstElementData = bestMatch.data; // Questo è number[]
  let distance = bestMatch.distance;

  // Assicurati che firstElementData sia un array di numeri valido
  if (!Array.isArray(firstElementData)) {
      //console.warn("autoVoicing_internal: Best match data is not an array.");
      firstElementData = []; // Fallback a array vuoto
  }

  let pv = new positionVector(firstElementData, target.modulo, target.span);

  return { pv: pv, inversion: r, distance: distance };
}

/**
 * Automatically matches and adjusts voicing between two position vectors, based on closest pitches.
 * Returns a new position vector that represents the updated voicing.
 *
 * @param v1 The positionVector containing the first position vector to be analyzed.
 * @param v2 The positionVector containing the second position vector to be analyzed.
 * @returns A new position vector that represents the updated voicing.
 */
export function autovoicingP2P(
  v1: positionVector,
  v2: positionVector
): positionVector {
  // Crea copie per non modificare gli originali
  const v1Data = [...v1.data];
  let out = [...v2.data];
  let used = new Array(out.length).fill(false);
  let mod = v2.modulo; // Usa il modulo di v2 come riferimento per il wrapping

  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < v1Data.length && i < out.length; ++i) {
    // Correzione: Usa l'asserzione non-null (!) perché 'i' è entro i limiti di v1Data
    const target = v1Data[i]!;
    let closest_diff = Infinity;
    let closest_index = -1; // Inizializza a -1 per indicare che non è stato trovato

    // Corretto: Usa < invece di &lt;
    for (let j = 0; j < out.length; ++j) { // Cerca in tutto l'array 'out'
      // Correzione: Usa l'asserzione non-null (!) perché 'j' è entro i limiti di out
      const currentOut = out[j]!;
      if (!used[j]) {
        // Differenza modulare (0 <= diff < mod)
        let diff = modulo(target - currentOut, mod);
        // Rendi la differenza simmetrica attorno a mod/2
        if (diff > mod / 2) diff = mod - diff;

        let abs_diff = Math.abs(target - currentOut);

        // Aggiorna se la differenza modulare è minore, o se è uguale ma la differenza assoluta è minore
        if (closest_index === -1 || diff < closest_diff || (diff === closest_diff && abs_diff < Math.abs(target - out[closest_index]!))) {
          closest_diff = diff;
          closest_index = j;
        }
      }
    }

    // Se è stato trovato un indice più vicino
    if (closest_index !== -1) {
        // Scambia l'elemento corrente 'i' con l'elemento più vicino trovato 'closest_index'
        [out[i], out[closest_index]] = [out[closest_index]!, out[i]!];
        used[i] = true; // Marca l'indice 'i' come usato

        // Correzione: Usa l'asserzione non-null (!) perché 'i' è stato appena assegnato
        const currentOutI = out[i]!;

        // Sposta la nota scambiata all'ottava più vicina a 'target'
        let octave_diff = target - currentOutI;
        // Arrotonda al multiplo più vicino di 'mod'
        let octave_shift = Math.round(octave_diff / mod) * mod;
        out[i] = currentOutI + octave_shift;

        // Controllo fine: se spostarsi di un'ottava avvicina di più
        if (Math.abs(target - (out[i]! + mod)) < Math.abs(target - out[i]!)) {
            out[i] = out[i]! + mod;
        } else if (Math.abs(target - (out[i]! - mod)) < Math.abs(target - out[i]!)) {
            out[i] = out[i]! - mod;
        }
    } else {
        // Se nessun elemento non usato è stato trovato (improbabile se v1.length <= v2.length)
        // Potresti voler gestire questo caso, es. non facendo nulla o loggando un warning
        //console.warn(`autovoicingP2P: No unused element found to match v1.data[${i}]`);
    }
  }

  // Ordina l'array risultante
  // Corretto: Usa => invece di =&gt;
  out.sort((a, b) => a - b);
  // Filtra eventuali undefined rimasti (anche se non dovrebbero esserci con le correzioni)
  const finalOutData = out.filter((v): v is number => v !== undefined);

  let outPV = new positionVector(finalOutData, v1.modulo, v1.span); // Usa modulo e span di v1 o v2? Decidi quale è più appropriato.
  outPV.spanUpdate();
  return outPV;
}


function degreeAreasMap(
  scale: positionVector,
  chord: positionVector
) :  [number[], number[], number[], number[]]{
    const scaleDegrees = scale.getIntervalTypes(); // Questo restituisce string[]

    const chordNorm = chord.normalizeToModulo();
    const chordDegTypes = new Set(chordNorm.getIntervalTypes()); // Questo restituisce Set<string>

    let degreeAreas : [number[], number[], number[], number[]] = [[],[],[],[]];
    // Corretto: Usa < invece di &lt;
    for ( let i = 0 ; i < scale.data.length ; i++ ){
      // Correzione: Usa l'asserzione non-null (!) perché 'i' è entro i limiti di scaleDegrees
      const actual = scaleDegrees[i]!;
      switch (actual) {
        case "f":
          degreeAreas[0].push(i);
          break;
        case "2min":
          degreeAreas[0].push(i);
          break;
        case "2":
          if(!chordDegTypes.has("3dim")){
            degreeAreas[0].unshift(i)
          } else{
            degreeAreas[1].push(i)
          }
          break;
        case "2aug":
          degreeAreas[0].unshift(i);
        break;
        case "3dim":
          degreeAreas[1].unshift(i);
          break;
        case "3min":
          degreeAreas[1].unshift(i);
          break;
        case "3maj":
          degreeAreas[1].unshift(i);
          break;
        case "3aug":
          degreeAreas[1].unshift(i);
          break;
        case "4":
          if(!chordDegTypes.has("3aug")){
            degreeAreas[1].push(i)
          } else{
            degreeAreas[1].unshift(i)
          }
          break;
        case "4aug":
          if(!chordDegTypes.has("5dim")){
            degreeAreas[1].push(i)
          } else{
            degreeAreas[2].push(i)
          }
          break;
        case "5dim":
          degreeAreas[2].push(i);
          break;
        case "5":
          degreeAreas[2].push(i);
          break;
        case "5aug":
          if(chordDegTypes.has("5aug")){
            degreeAreas[2].unshift(i)
          } else{
            degreeAreas[3].push(i)
          }
          break;
        case "6min":
          if(chordDegTypes.has("5aug")){
            degreeAreas[2].unshift(i)
          } else{
            degreeAreas[2].push(i)
          }
          break;
        case "6":
          if(chordDegTypes.has("7dim")){
            degreeAreas[3].push(i)
          } else {
            degreeAreas[2].push(i)
          }
          break;
        case "6aug":
          if(chordDegTypes.has("7min")){
            degreeAreas[3].push(i)
          } else {
            degreeAreas[2].push(i)
          }
          break;
        case "7dim":
          degreeAreas[3].unshift(i);
          break;
        case "7min":
          degreeAreas[3].unshift(i);
          break;
        case "7maj":
          degreeAreas[3].unshift(i);
          break;
      }
    }
  return degreeAreas
}

/**
 * Generates a block chord based on the given **scale**, **degree**, and **chordDegrees**.
 * The function considers the **lastChord** for voice leading and can generate cluster chords if specified.
 *
 * - It determines the voicing based on the degree function of the scale.
 * - **Now supports scales of variable lengths**, enhancing flexibility.
 * - It selects notes to avoid voice repetition and avoid notes.
 * - If `cluster` is `true`, it generates a five-voice block chord by adding appropriate notes.
 *
 * @param scale - The scale as a **positionVector**, which can have a variable length, with a modulo and span of 12.
 * @param degree - The degree of the lead.
 * @param chord - The chord as a **positionVector**.
 * @param lastChord - The previous chord as a **positionVector** for comparison.
 * @param cluster - If `true`, generates a block chord with five voices (default is `false`).
 * @returns A **positionVector** representing the generated block chord.
 */
export function blockChord(
  scale: positionVector,
  degree: number,
  chordDegreesValues: positionVector,
  lastChord: positionVector,
  cluster: boolean = false
): positionVector {
  let voicing = new positionVector([degree], scale.data.length, scale.data.length);
  const chordDegrees = chordDegreesValues.normalizeToModulo();
  const reference = lastChord.data;
  let index = -1;
  let degFunc = scale.getDegrees()[modulo(degree, scale.data.length)];
  if (degFunc == 0 || (degFunc == 1 && chordDegrees.data[1] != 1)) {
    index = 0;
  } else if (
    (degFunc == 1 && chordDegrees.data[1] == 1) ||
    degFunc == 2 ||
    degFunc == 3
  ) {
    index = 1;
  } else if (degFunc == 4 || (degFunc == 5 && chordDegrees.data[3] != 5)) {
    index = 2;
  } else {
    index = 3;
  }
  let octave = Math.floor(degree / voicing.modulo) * voicing.modulo;
  const chord = scale.selectFromPosition(chordDegrees);
  const scaleDegreeFunction = scale.getDegrees();
  for (let i = 1; i < 4; i++) {
    let actualDegree = chordDegrees.element(index - i) + octave;
    let zeroDegree = scaleDegreeFunction[modulo(actualDegree, scale.data.length)];
    switch (zeroDegree) {
      case 0:
        if (
          scaleDegreeFunction[modulo(actualDegree + 1, scale.data.length)] != 2 && // If the next degree is not a third
          chordDegrees.data[1] != 1 && // If the chord is not sus2
          reference[reference.length - i - 1] != scale.element(actualDegree + 1) && // If the note is not repeated
          !chord.isAvoid(scale.element(1)) // If the next note is not an avoid note
        ) {
          voicing.data.unshift(actualDegree + 1); // Increase the degree
        } else {
          voicing.data.unshift(actualDegree); // Otherwise, add the fundamental
        }
        break;
      case 1:
        if(i == 1 && scale.element(voicing.data[0]!) - scale.element(actualDegree) == 1){ // If the actual degree is at half step from the lead note
            voicing.data.unshift(actualDegree - 1);
        }
        else {
            voicing.data.unshift(actualDegree);
        }        break;
      case 2:
        voicing.data.unshift(actualDegree); // Add the third
        break;
      case 3:
        voicing.data.unshift(actualDegree); // Add the fourth
        break;
      case 4:
        if (
          scaleDegreeFunction[modulo(actualDegree + 1, scale.data.length)] != 6 && // If the next degree is not a seventh
          chordDegrees.data[3] != 5 && // If the base chord is not a sixth
          reference[reference.length - i - 1] == scale.element(actualDegree) && // If the note is repeated
          !chord.isAvoid(scale.element(actualDegree + 1)) && // If the next degree is not an avoid note
          voicing.data[1] != (actualDegree + 1) &&           // If the next degree is not the same as the previous one
          (i == 1 && scale.element(voicing.data[0]!) - scale.element(actualDegree + 1) != 1) // If the actual degree is at half step from the lead note

        ) {
          voicing.data.unshift(actualDegree + 1);  // Add the next degree
        } else {
          voicing.data.unshift(actualDegree);  // Add the current degree
        }
        break;
      case 5:
        if (i == 1 &&
            scale.element(voicing.data[0]!) - scale.element(actualDegree) == 1 // If the actual degree is at half step from the lead note
        ) {
            voicing.data.unshift(actualDegree - 1);
        } else {
            voicing.data.unshift(actualDegree);
        }
        break;
      case 6:
        if (
          i == 1 &&
          scale.element(voicing.data[0]!) - scale.element(actualDegree) == 1 // If the actual degree is at half step from the lead note
        ) {
          voicing.data.unshift(actualDegree - 1);
        } else {
          voicing.data.unshift(actualDegree);
        }
        break;
    }
  }

  let blockchord = scale.selectFromPosition(voicing);

  if (cluster == true) {
    let j = 0;
    let clusterV: positionVector[] = [];

    for (let i = degree - scale.data.length + 1; i < degree; i++) {
      if (
        scale.element(degree) - scale.element(i) != 1 &&
        !voicing.isNote(i) &&
        !scale.selectFromPosition(chordDegrees).isAvoid(scale.element(i))
      ) {
        // Create a new instance of positionVector by copying the data from 'voicing'
        let candidate = new positionVector([...voicing.data], voicing.modulo, voicing.span);
        candidate.data.push(i);
        candidate.data.sort((a, b) => a - b);
        clusterV.push(candidate);
      } else {
        j++;
      }
    }

    // Assign a score to each candidate
    let scoredCandidates = clusterV.map((candidate) => {
      let score = 0;
      let minLength = Math.min(candidate.data.length, lastChord.data.length);
      for (let i = 0; i < minLength; i++) {
        if (candidate.data[i] == lastChord.data[i]) {
          score -= 1; // Penalize voices that repeat at the same position
        }
      }
      return { candidate, score };
    });

    // Find the maximum score
    let maxScore = Math.max(...scoredCandidates.map((c) => c.score));

    // Select all candidates with the maximum score
    let bestCandidates = scoredCandidates
      .filter((c) => c.score == maxScore)
      .map((c) => c.candidate);

    // If there are multiple candidates with the same score, choose one randomly
    let selectedCandidate;
    if (bestCandidates.length == 1) {
      selectedCandidate = bestCandidates[0];
    } else {
      selectedCandidate = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    }
    return scale.selectFromPosition(selectedCandidate!);
  } else { 
    return blockchord;
  }
}

/**
 * Represents the range of a musical voice or instrument.
 * This class is used to determine if a given note is within the playable range for a particular voice or instrument.
 *
 * @param name - The name of the voice or instrument (e.g., "soprano").
 * @param range - A tuple representing the minimum and maximum MIDI note numbers that the voice can produce.
 */
export class VoiceRange {
  name: string;
  range: [number, number];

  constructor(name: string, range: [number, number]) {
    this.name = name;
    this.range = range;
  }

  /**
   * Checks if a given note is within the voice's range.
   *
   * @param num - The MIDI note number to check.
   * @returns A boolean indicating whether the note is in range.
   */
  inRange(num: number): boolean {
    // Corretto: Usa >= e <= invece di &gt;= e &lt;=
    return num >= this.range[0] && num <= this.range[1];
  }
}

/**
 * Predefined voice ranges for common vocal types.
 * Each VoiceRange represents a vocal type (e.g., "soprano") with a defined range of MIDI notes.
 */
export const VoiceRanges: VoiceRange[] = [
  new VoiceRange("soprano", [60, 84]),
  new VoiceRange("mezzosoprano", [57, 83]),
  new VoiceRange("contralto", [53, 79]),
  new VoiceRange("tenore", [48, 72]),
  new VoiceRange("baritono", [45, 67]),
  new VoiceRange("basso", [40, 64]),
];

/**
 * Spreads a chord based on the given scale, chord degrees, and instrument ranges.
 * This function distributes the chord notes across the provided instruments, determining the top note and bass note to achieve a well-balanced spread.
 *
 * @param scale - The musical scale represented as a **positionVector**.
 * @param chordDegrees - The degrees of the chord within the scale as a **positionVector**.
 * @param instruments - An array of **VoiceRange** objects representing the ranges of the instruments.
 * @param topDegree - (Optional) The degree for the top note.
 * @param bassDegree - (Optional) The degree for the bass note.
 * @param lastChord - (Optional) The previous chord represented as a **positionVector** for smoother transitions.
 * @returns A **positionVector** representing the assigned notes for the chord spread.
 */
export function spread(
  scale: positionVector,
  chordDegrees: positionVector,
  instruments: VoiceRange[],
  topDegree?: number,
  bassDegree?: number,
  lastChord?: positionVector
): SpreadResult {
  // Sort instruments according to the lowest note they can play
  instruments.sort((a, b) => a.range[0] - b.range[0]);
  const chordDegreesSet = new Set(chordDegrees.data);
  let usedDegrees = new Set();

  // Ensure the number of voices does not exceed the number of instruments
  let voices = instruments.length;

  // Determine the top note
  let topNote: number;
  const highestInstrument = instruments[voices - 1];
  let higherReference: number;

  if (topDegree === undefined || topDegree === null) {
    // If topDegree is undefined, assign the highest note of the spread within the correct range
    if (lastChord === undefined || lastChord.data.length === 0 || lastChord === null) {
      // The reference is in the middle register of the instrument
      higherReference = (highestInstrument!.range[1] + highestInstrument!.range[0]) / 2;
    } else {
      // The reference is the previous note
      higherReference = lastChord.data[lastChord.data.length - 1]!;
    }
    let highestCandidateInf = 0;
    let degreeHigh = 0;
    while (scale.element(highestCandidateInf) <= higherReference) {
      degreeHigh++;
      highestCandidateInf = chordDegrees.element(degreeHigh);
    }
    let highestCandidateSup = chordDegrees.element(degreeHigh + 1);

    // Center the lower candidate on a chord degree
    while (!chordDegreesSet.has(modulo(highestCandidateInf, chordDegrees.modulo)) || scale.element(highestCandidateInf) > highestInstrument!.range[1]) {
      highestCandidateInf--;
    }

    // Center the upper candidate on a chord degree
    while (!chordDegreesSet.has(modulo(highestCandidateSup, chordDegrees.modulo)) || scale.element(highestCandidateSup) < highestInstrument!.range[0]) {
      highestCandidateSup++;
    }

    let topNoteCandidate;

    // Choose the best candidate
    if (Math.abs(higherReference - scale.element(highestCandidateInf)) <= Math.abs(higherReference - scale.element(highestCandidateSup))) {
      topNoteCandidate = scale.element(highestCandidateInf);
    } else {
      topNoteCandidate = scale.element(highestCandidateSup);
    }

    topNote = topNoteCandidate;
  } else {
      let topNoteCandidate = scale.element(topDegree);
      // while (highestInstrument!.inRange(topNoteCandidate)) {
      //     if (topNoteCandidate < highestInstrument!.range[0]) {
      //         topNoteCandidate += scale.modulo;
      //     } else if (topNoteCandidate > highestInstrument!.range[1]) {
      //         topNoteCandidate -= scale.modulo;
      //     }
      // }
      topNote = topNoteCandidate;
    } 
    //  post(topNote, "Top note selected: " + topNote);

  // Determine the bass note
  let bassNote = scale.element(0);
  const lowestInstrument = instruments[0];

  if (bassDegree === undefined || bassDegree === null) {
    // If the bass is undefined, assign the bass of the spread to the fundamental adjusted into the correct range
    let fundamentalNote = scale.element(0);

    // Start from a comfortable note, one octave below the center of the range
    let bassReference = lastChord === undefined
      ? (lowestInstrument!.range[0] + lowestInstrument!.range[1]) / 2
      : lastChord.data[0];

    while (fundamentalNote >= lowestInstrument!.range[0]) {
      fundamentalNote -= scale.modulo;
    }
    let possibleBasses = [];

    while (fundamentalNote <= lowestInstrument!.range[1]) {
      if (lowestInstrument!.inRange(fundamentalNote)) {
        possibleBasses.push(fundamentalNote);
      }
      fundamentalNote += scale.modulo;
    }
    let distance = Infinity;
    // Adjust fundamentalNote into the instrument's range
    bassNote = possibleBasses[0]!;
        for (let i = 0; i < possibleBasses.length; i++) {
             let currentDistance = Math.abs(scale.element(possibleBasses[i]!) - bassReference!);
             let isTooFarFromTop = (Math.abs(scale.element(possibleBasses[i]!)) - topNote) >= (scale.modulo * 1.5);
             if (currentDistance <= distance && !isTooFarFromTop) {
                 distance = currentDistance;
                 bassNote = possibleBasses[i]!;
             }
        }
  } else {
    // If the bass is present, assign the bass of the spread in the correct range not lower than bassDegree
    let bassNoteCandidate = scale.element(bassDegree);

    // Ensure bassNoteCandidate is not lower than the original bassDegree
    const originalBassNote = scale.element(bassDegree);
    while (bassNoteCandidate < originalBassNote || !lowestInstrument!.inRange(bassNoteCandidate)) {
      bassNoteCandidate += scale.modulo;
    }

    bassNote = bassNoteCandidate;
  }

  let candidatesPv = new positionVector([bassNote, topNote], scale.data.length, scale.data.length);
  usedDegrees.add(modulo(inverse_select(candidatesPv, scale).data[0]!, scale.data.length));
  usedDegrees.add(modulo(inverse_select(candidatesPv, scale).data[1]!, scale.data.length));

  let candateDegrees = inverse_select(candidatesPv, scale);
  // Now assign notes to each voice
  let possibleDegrees: number[] = [];
  for (let i = candateDegrees.data[0]! + 1; i < candateDegrees.data[1]!; i++) {
    if (chordDegreesSet.has(modulo(i, scale.data.length))) {
      possibleDegrees.push(i);
    }
  }
  let result = [bassNote];

  let possibilities: number[][] = Array.from({ length: voices - 2 }, () => []);

  let essentialDegrees = new Set<number>();
  if (chordDegreesSet.has(0) && !usedDegrees.has(0)) {
    essentialDegrees.add(0); // Third
  }
  if (chordDegreesSet.has(2) && !usedDegrees.has(2)) {
    essentialDegrees.add(2); // Third
  }
  if (chordDegreesSet.has(6) && !usedDegrees.has(6)) {
    essentialDegrees.add(6); // Seventh
  } else if (chordDegreesSet.has(5) && !usedDegrees.has(5)) {
    essentialDegrees.add(5); // Sixth if the seventh is not present
  }
  if (!essentialDegrees.has(2) && chordDegreesSet.has(1)) {
    essentialDegrees.add(1); // Second if the third is not present
  }

  for (let voice = 1; voice < voices - 1; voice++) {
    for (let possibleDegree of possibleDegrees) {
      let actualtNote = scale.element(possibleDegree);

      if (instruments[voice]!.inRange(actualtNote) &&
        !((voice == 1) && actualtNote < 50 && (actualtNote - bassNote) < 7) &&
        !((voice == voices - 2) && (actualtNote - topNote) > 1) &&
        !(scale.isExtension(actualtNote) && (actualtNote - bassNote < scale.modulo))) {
        possibilities[voice - 1]!.push(actualtNote);
      }
    }
    if (possibilities[voice - 1]!.length === 0) {
      // console.warn(`Voice ${voice} has no possible degrees within range.`);
    }
  }

  let innerVoicesTar: number[] = [];
    if (lastChord == undefined || lastChord == null || lastChord.data.length < voices - 1){
    for (let i = 0; i < voices - 2; i++) {
      innerVoicesTar[i] = Math.round((topNote - bassNote) / (voices - 1)) * (i + 1) + bassNote;
    }
  } else {
    for (let i = 1; i < voices - 1; i++) {
      innerVoicesTar[i] = lastChord.data[i + 1]!;
    }
  }

  // Generate all possible combinations for inner voices, respecting ascending order
  function generateCombinations(possibilities: number[][]): number[][] {
    let results: number[][] = [];

    function backtrack(current: number[], depth: number) {
      if (depth === possibilities.length) {
        results.push([...current]);
        return;
      }

      for (let note of possibilities[depth]!) {
        if (current.length === 0 || note >= current[current.length - 1]!) {
          current.push(note);
          backtrack(current, depth + 1);
          current.pop();
        }
      }
    }

    backtrack([], 0);
    return results;
  }

  const innerVoiceCombinations = generateCombinations(possibilities);
  // Filter combinations that do not respect possibilities for each voice, contain essentialDegrees, or have distances between voices greater than scale.modulo
  const validCombinations = innerVoiceCombinations.filter(combination => {
    const combinationSet = new Set<number>(combination.map(note => modulo(inverse_select(new positionVector([note], scale.data.length, scale.data.length), scale).data[0]!, scale.data.length)));
    return combination.every((note, index) => possibilities[index]!.includes(note)) &&
           Array.from(essentialDegrees).every(degree => combinationSet.has(degree)) &&
           combination.every((note, index) => index === 0 || (note - combination[index - 1]!) <= scale.modulo);
  });


  // Select the combination that best matches innerVoicesTar (i.e., is closest)
  function calculateDistance(combination: number[], target: number[]): number {
    let distance = 0;
    for (let i = 0; i < combination.length; i++) {
      distance += Math.abs(combination[i]! - target[i]!);
    }
    return distance;
  }

  let bestCombination = validCombinations[0];
  let minDistance = calculateDistance(validCombinations[0]!, innerVoicesTar);

  for (let combination of validCombinations) {
    const distance = calculateDistance(combination, innerVoicesTar);
    if (distance < minDistance) {
      minDistance = distance;
      bestCombination = combination;
    }
  }

  // Add the best combination to the result notes
  result.push(...bestCombination!);

  result.push(topNote);

  // Return the assigned notes as a positionVector
  // return new positionVector(result, scale.modulo, scale.modulo);
  const instrumentNotes: { [instrumentName: string]: number } = {};
  for (let i = 0; i < voices; i++) {
    instrumentNotes[`${instruments[i]!.name}_${i}`] = result[i]!;
  }

  return {
    data: instrumentNotes,
    modulo: scale.modulo,
    span: scale.modulo,
  } as SpreadResult; // Utilizzo di 'any' per evitare errori di tipo, ma idealmente definirei un'interfaccia per questo tipo di ritorno
}

export interface SpreadResult {
  data: { [instrumentName: string]: number };
  modulo: number;
  span: number;
}

/**
 * Analyzes a `positionVector` representing a chord, identifying its name and root.
 * The function supports complex chords, including slash chords, by determining the
 * chord's quality (e.g., major, minor, diminished) and any extensions.
 *
 * @param chordVector - The `positionVector` representing the chord to analyze.
 * @param allowSlashChords - A boolean indicating whether to allow slash chords (default: false).
 * @returns An object containing:
 *   - `chordName`: The name of the chord as a string.
 *   - `root`: The root of the chord as a `positionVector`, calculated as the lowest note of the selected candidate.
 */


interface ScoredChordInfo {
  score: number;
  name: string;
  root: positionVector;
}

export function getChordName(
  chordVector: positionVector,
  allowSlashChords = false
): { chordName: string ; root: positionVector , all : ScoredChordInfo[] } { // Tipo di ritorno esplicito

    // Controllo input vuoto (buona pratica mantenuta dalla seconda versione)
    if (chordVector.data.length === 0) {
        //console.warn("getChordName: Input chordVector is empty.");
        // Restituisce un valore di default sensato
        return { chordName: "N.C.", root: new positionVector([], chordVector.modulo, chordVector.span), all: [] };
    }

    // ---- Inizio Logica dalla PRIMA versione ----
    let chord = chordVector; // Usa 'chord' come nella versione originale per coerenza logica interna

    // Normalizza rispetto alla prima nota (assicurandoci che esista con il check sopra)
    // Usiamo l'asserzione non-null (!) perché abbiamo controllato che data non è vuoto
    chord = chord.sum(-chordVector.data[0]!);

    // Applica modulo e ordina
    for (let i = 1; i < chord.data.length; i++) {
      // Usiamo l'asserzione non-null (!) perché 'i' è entro i limiti
      chord.data[i] = modulo(chord.data[i]!, chord.modulo);
    }
    chord.data.sort((a, b) => a - b); // Sintassi ES6 per sort
    chord.data = [...new Set(chord.data)]; // Rimuove i duplicati
    // Riporta all'ottava originale (approssimativamente)
    // Usiamo l'asserzione non-null (!) perché abbiamo controllato che data non è vuoto
    chord = chord.sum(+chordVector.data[0]!);
    // ---- Fine Logica dalla PRIMA versione (Normalizzazione) ----

    let candidates: positionVector[] = [];
    let iTcandidates: Set<string>[] = [];
    // Tipo esplicito per chiarezza, inversion può essere string o undefined
    let chordNames: [positionVector, string, string[], number | undefined][] = [];
    let length = 1;
    
    if (allowSlashChords) {
      length = chord.data.length; // Usa chordVector.data.length come nell'originale
    }

    for (let i = 0; i < length; i++) {
      let candidate = chord.rototranslate(i, chord.data.length, false);
      if (candidate.data.length === 0) continue;

      const originalRootNormalized = chord.element(0);
      // --- Logica di rimozione estensione (leggermente modificata per chiarezza/robustezza) ---
      let analyzeCandidate = candidate; // Lavora su una copia o riferimento temporaneo
      let isActuallyInverted = (i !== 0); // Flag per sapere se siamo in un'inversione

      if (isActuallyInverted && originalRootNormalized !== undefined /*&& candidate.isExtension(originalRootNormalized)*/) { 
          const indexToRemove = candidate.data.indexOf(originalRootNormalized);
          if (indexToRemove !== -1) {
              // Crea una nuova istanza senza l'elemento rimosso per l'analisi
              const filteredData = candidate.data.filter((_, idx) => idx !== indexToRemove);
              if (filteredData.length === 0) continue; // Salta se rimane vuoto
              analyzeCandidate = new positionVector(filteredData, candidate.modulo, candidate.span);
          }
          // Se non trovato, procedi con l'analisi del candidato originale (comportamento implicito precedente)
      }
      // --- Fine logica rimozione ---

      // Rimuovi duplicati dal candidato da analizzare
      analyzeCandidate.data = [...new Set(analyzeCandidate.data)];
      if (analyzeCandidate.data.length === 0) continue; // Salta se diventa vuoto dopo Set

      let iTCandidate = new Set(analyzeCandidate.getIntervalTypes());


      let chordBase = "";
      let chordQuality: string[] = []; // Tipo esplicito
      let inversion: number | undefined = undefined; // Inizializza come undefined

      // Determine the basic chord quality (Logica ESATTA dalla PRIMA versione)
      if (iTCandidate.has("5aug")) {
        chordBase = "+";
      }
      if (iTCandidate.has("3min")) {
        if (iTCandidate.has("5dim")) {
          chordBase = "dim";
        } else {
          chordBase = "-";
        }
      } else if (
        !iTCandidate.has("3maj") &&
        !iTCandidate.has("3min") && // Nota: questa condizione originale è un po' strana (sia 3min che 3aug?)
        !iTCandidate.has("3dim") && // Nota: questa condizione originale è un po' strana (sia 3dim che 3aug?)
        !iTCandidate.has("3aug") &&
        iTCandidate.has("5")  
      ) {
        chordBase = "5";
      }

      // Add seventh, sixth, or extended notes to the chord quality (Logica ESATTA dalla PRIMA versione)
      if (iTCandidate.has("7maj")) {
        chordBase += "maj7";
      } else if (iTCandidate.has("7min")) {
        if (chordBase == "dim") { // Usa == come nell'originale, anche se === è preferibile
          chordBase = "ø";
        }
        // Aggiunge sempre 7 se c'è 7min, anche se la base è già "-", "+" o vuota
        chordBase += "7";
      } else if (iTCandidate.has("7dim")) {
        if (chordBase != "dim") { // Usa != come nell'originale
          // Se non è 'dim' E c'è '7dim', l'originale aggiungeva '6'.
          // Questo potrebbe essere un'euristica per accordi 6/dim o simili, la manteniamo.
          chordBase += "6";
        } else {
          // Se è 'dim' E c'è '7dim', diventa un accordo diminuito (dim7)
          chordBase += "7";
        }
      }
      if (iTCandidate.has("5dim") && !iTCandidate.has("7dim") && !iTCandidate.has("3min")) { 
        chordBase += "(♭5)"
      }; // Evita doppioni
      
      // Handle suspended chords (Logica ESATTA dalla PRIMA versione)
      // Nota: 3aug = P4, 3dim = M2
      if (iTCandidate.has("4") && iTCandidate.has("3dim")) { // Originale: 4 e M2 => sus2/4? Strano ma fedele.
        chordQuality.push("sus2/4");
      } else if (iTCandidate.has("3aug")) { // Originale: P4 => sus4
        chordQuality.push("sus4");
      } else if (iTCandidate.has("3dim")) { // Originale: M2 => sus2
        chordQuality.push("sus2");
      }
      
      // Add extended notes to the chord quality (Logica ESATTA dalla PRIMA versione)
      const hasMajMinSeventh = iTCandidate.has("7maj") || iTCandidate.has("7min");

      if (iTCandidate.has("2min")) { // b9
        if (!hasMajMinSeventh) {
          chordQuality.push("(add♭9)");
        } else {
          chordQuality.push("(♭9)");
        }
      }
      if (iTCandidate.has("2")) { // 9
        if (!hasMajMinSeventh) {
          chordQuality.push("(add9)");
        } else {
          chordQuality.push("(9)");
        }
      }
      if (iTCandidate.has("2aug")) { // #9
        if (!hasMajMinSeventh) {
          chordQuality.push("(add♯9)");
        } else {
          chordQuality.push("(♯9)");
        }
      }
      // Logica originale per 11:
      if (iTCandidate.has("4") && !iTCandidate.has("3dim")) { // C'è la 4, non è sus2
        if (
          (!hasMajMinSeventh) || // Non c'è settima maj/min O
          iTCandidate.has("3maj") // C'è la terza maggiore (anche con settima)
        ) {
          chordQuality.push("(add11)"); // L'originale la chiama add11 in questi casi
        } else {
          chordQuality.push("(11)"); // Altrimenti (es. accordo minore settima con 11)
        }
      }
      if (iTCandidate.has("4aug")) { // #11
        if (!hasMajMinSeventh) {
          chordQuality.push("(add♯11)");
        } else {
          chordQuality.push("(♯11)");
        }
      }
      if (iTCandidate.has("6min")) { // b13
        if (!hasMajMinSeventh) {
          chordQuality.push("(add♭13)");
        } else {
          chordQuality.push("(♭13)");
        }
      }
      if (iTCandidate.has("6")) { // 13
        // Evita di aggiungere "13" se la base è già un accordo di sesta (determinato prima)
        if (!chordBase.includes("6")) {
            if (!hasMajMinSeventh) {
                chordQuality.push("(add13)");
            } else {
                chordQuality.push("(13)");
            }
        }
      }
      if (iTCandidate.has("6aug")) { // #13 (o b7?) - L'originale aggiungeva #13, manteniamolo
        chordQuality.push("(♯13)");
      }

      // Omissions (Logica ESATTA dalla PRIMA versione)
      if (
        !iTCandidate.has("3maj") &&
        !iTCandidate.has("3min") &&
        !iTCandidate.has("3aug") && // = P4
        !iTCandidate.has("3dim")    // = M2
        // Questa condizione significa: nessuna terza e non è un accordo sus
      ) {
        // Aggiungi (omit3) solo se non è già implicitamente un accordo '5' (power chord)
        if (chordBase !== '5' && !chordQuality.some(q => q.startsWith('sus'))) {
          chordQuality.push("(omit3)");
        }
      }
      if (
        !iTCandidate.has("5") &&    // P5
        !iTCandidate.has("5dim") && // d5
        !iTCandidate.has("5aug")    // A5
      ) {
        // Aggiungi (omit5) solo se la base non è già diminuita o aumentata (che definiscono la quinta)
        if (chordBase !== 'dim' && chordBase !== '+' && chordBase !== 'ø') {
            chordQuality.push("(omit5)");
        }
      }

      // Assign the root (Logica ESATTA dalla PRIMA versione)
      // Assicurati che candidate.data[0] esista (dovrebbe grazie al check iniziale e continue)
      const candidato = candidate;
      const scaleNamesResult = scaleNames(candidato, false, false, true); // Il quarto parametro nell'originale era true, manteniamolo
      // Determine inversion (Logica ESATTA dalla PRIMA versione)
      if (allowSlashChords && i !== 0) {
          // L'originale usava scaleNames sull'oggetto 'chord' (quello normalizzato e riportato all'ottava)
          // Questo dà il nome della nota al basso *dell'accordo originale*, che è ciò che serve per il slash chord.
          // Usa chordVector per ottenere la nota al basso *originale non normalizzata*
          const originalBassNote = chordVector.data[0]!; // Sappiamo che esiste
          const bassPv = new positionVector([originalBassNote], chordVector.modulo, chordVector.span);
          const bassDeg = inverse_select(bassPv, candidato).normalizeToModulo().data[0]!;
          // Chiama scaleNames per ottenere il nome della nota al basso
          if (bassDeg) { // Assicurati che il nome sia stato trovato
              inversion =   bassDeg;
          }
      }

      // Store the chord components
      chordNames.push([candidato, chordBase, chordQuality, inversion]);
      // ---- Fine Logica dalla PRIMA versione (Analisi Candidato) ----
    }

  const calculateChordScore = (parts: [positionVector, string, string[], number | undefined]): number => {
      let score = 0;
      const chordBase = parts[1];
      const chordQuality = parts[2];
      const inversion = parts[3];

      // 1. Penalità base per la lunghezza della qualità
      score += chordQuality.length * 3;
      // 2. Penalità per Inversione
      if (inversion !== undefined ) {
        score += 5;
      }
      // 3. Penalità per Omissioni
      if (chordQuality.includes("(omit3)")) {
        score += 10;
      }
      if (chordQuality.includes("(omit5)")) {
        score += (chordBase === '5') ? 8 : 12;
      }
      // 4. Penalità per Suspended
      if (chordQuality.some(q => q.startsWith("sus"))) {
        score += (chordBase === '5') ? 2 : 4;
      }
      // 5. Penalità per Alterazioni specifiche e Estensioni Alte
      chordQuality.forEach(q => {
        if (q.includes('♭') || q.includes('♯') || q.includes('#')) {
          score += 2;
        }
        if (q.includes('(11)') && !q.includes("(♯11)")) {
            score += 1;
        }
        if (q.includes('(13)')) {
          score += 1;
        }
        if (q.startsWith('(add')) {
            score += 6;
        }
      });
      // 7. Leggera preferenza per accordi base standard (Maj/min)
      if (chordBase !== "" && chordBase !== "-") {
          if (!["+", "dim", "ø", "5"].includes(chordBase) && !chordQuality.some(q => q.startsWith("sus"))) {
            score += 1;
          }
      }
      return score;
    };

    // --- Calcola score e costruisci il nome per ogni candidato ---
    const scoredChordCandidates: ScoredChordInfo[] = [];

    for (const candidateParts of chordNames) {
        const score = calculateChordScore(candidateParts);
        const rootPv = candidateParts[0]!;
        const chordBaseStr = candidateParts[1]!;
        const chordQualityArr = candidateParts[2]!;
        
        // Costruisci il nome dell'accordo come stringa
        const scaleNamesResult = scaleNames(candidateParts[0], false, false, true);
        const inversionStr =  scaleNamesResult[candidateParts[3]!]; // Può essere undefined  const
        const rootNameResult = scaleNamesResult[0];  
        const rootName = rootNameResult ?? "N"; // Fallback a "N"
        const qualityStr = chordQualityArr.join("");
        let inversionFinalStr = inversionStr ?? "";
        if(inversionFinalStr){inversionFinalStr = "/" + inversionFinalStr};
        const chordNameString = `${rootName}${chordBaseStr}${qualityStr}${inversionFinalStr}`;
// trovami
        // Aggiungi l'oggetto con score, nome e root all'array
        scoredChordCandidates.push({
            score: score,
            name: chordNameString,
            root: candidateParts[0] // Manteniamo il rootPv specifico di questo candidato
        });
        
    }

    // --- Gestione caso nessun candidato valido ---
    if (scoredChordCandidates.length === 0) {
      // Questo può accadere se chordNames era vuoto o se tutti i candidati
      // hanno generato errori durante la costruzione del nome (improbabile)
      //console.warn("getChordName: No scorable chord candidates found.");
      const fallbackRootNote = chordVector.data[0] ?? 0;
      const fallbackRootPv = new positionVector([fallbackRootNote], chordVector.modulo, chordVector.span);
      // Potremmo restituire il nome più semplice possibile basato sulla root originale
      const fallbackRootName = scaleNames(fallbackRootPv, false, false, false)[0] ?? "N.C.";
      return { chordName: fallbackRootName , root: fallbackRootPv.normalizeToModulo() , all: [] };
    }

    // --- Ordina i candidati finali SOLO in base allo score (crescente) ---
    scoredChordCandidates.sort((a, b) => a.score - b.score);

    // --- Rimuovi il blocco while di filtraggio ---
    // Il blocco while che iniziava con 'let i = 0; while...' è stato rimosso.
    // Ora ci affidiamo completamente all'ordinamento basato sullo score.

    // --- Seleziona il migliore (il primo dopo l'ordinamento) ---
    // L'indice 'i' non è più necessario, prendiamo sempre il primo elemento.
    const bestScoredChord : ScoredChordInfo = scoredChordCandidates[0]!;

    // --- Restituisci il risultato ---
    return {
      chordName: bestScoredChord.name,
      // Normalizza la root solo alla fine, prima di restituirla
      root: bestScoredChord.root.normalizeToModulo(),
      all: scoredChordCandidates
    };
  }

  class NoteName {
    position: number;
    name: string;
    cents?: number;
  
    constructor(position : number , name : string, cents? : number) {
      this.position = position;
      this.name = name;
      this.cents = cents;
    }
  
  }
  
  class ScaleNamesClass {
    modulo: number;
    notes: NoteName[];
  
    constructor(
    scala: positionVector,
    ita: boolean = true,
    useCents: boolean = false,
    checkEnharmonic: boolean = true,
    isChord: boolean = false
    ) {
      this.modulo = scala.modulo;
      
      let normalized = scala.normalizeToModulo()
      normalized.data = normalized.data.filter((item, index) => normalized.data.indexOf(item) === index);
      const names = scaleNames_internal(normalized, ita, useCents, checkEnharmonic, isChord)
      let noteOut : NoteName[] = [];

      for (let i = 0 ; i < normalized.data.length ; i++){
        const actualNote : NoteName = new NoteName(normalized.data[i]!,names[i]!);
        noteOut[i] = actualNote;
      }
      
      this.notes = noteOut!;
    }
  }

  export function scaleNames(
    scala: positionVector,
    ita: boolean = true,
    useCents: boolean = false,
    checkEnharmonic: boolean = true,
    isChord: boolean = false
    ): string[] {

    // 1. Handle empty input scale
    if (!scala || !scala.data || scala.data.length === 0) {
      return [];
    }

    // 2. Get the processed names for unique notes via ScaleNamesClass
    const scaleClass = new ScaleNamesClass(scala, ita, useCents, checkEnharmonic, isChord);

    // 3. Create a lookup map from position (pitch class) to name
    const nameMap = new Map<number, string>();
    for (const noteName of scaleClass.notes) {
      // The key should be the pitch class (position modulo modulo)
      nameMap.set(modulo(noteName.position, scala.modulo), noteName.name);
    }

    // 4. Iterate through the ORIGINAL scala.data and map to names using the lookup map
    const resultNames: string[] = new Array(scala.data.length);
    for (let i = 0; i < scala.data.length; i++) {
      const originalNote = scala.data[i];

      if (originalNote === undefined) {
        resultNames[i] = "N/A"; // Placeholder for undefined input notes
        continue;
      }

      const pitchClass = modulo(originalNote, scala.modulo);
      const foundName = nameMap.get(pitchClass);

      if (foundName !== undefined) {
        resultNames[i] = foundName;
      } else {
        // Fallback if a name wasn't generated for this pitch class
        // This might indicate an issue in scaleNames_internal or normalization logic
        // console.warn(`Name not found for note ${originalNote} (pitch class ${pitchClass})`);
        resultNames[i] = "?"; // Placeholder for missing names
      }
    }

    // 5. Return the ordered array of names
    return resultNames;
  }
  

//andrebbe aggiornata questa funzione in positionVector
/**
 * BUG: se checkEnharmonic = false, non viene restituito il nome corretto
 * usare checkEnharmonic = true
 * 
 * 
 * Function: scaleNames
 *
 * Generates an array of strings representing the names of the notes in a musical scale.
 * The function adjusts the notes based on their position relative to a standard scale,
 * handles enharmonic equivalents, and optionally displays deviations in cents or microtonal symbols.
 *
 * @param {positionVector} scala - An object representing the musical scale as a position vector.
 * @param {boolean} [ita=true] - Whether to use Italian notation ("Do, Re, Mi") or English notation ("C, D, E").
 * @param {boolean} [useCents=false] - Whether to include deviations in cents for altered notes.
 * @param {boolean} [checkEnharmonic=true] - Whether to enable adjustments for enharmonic equivalents.
 * @param {boolean} [isChord=false] - Indicates if the input 'scala' represents a chord for specific root finding logic.
 * @returns {string[]} - An array of note names with appropriate alterations or deviations.
 */
function scaleNames_internal(
  scala: positionVector,
  ita: boolean = true,
  useCents: boolean = false,
  checkEnharmonic: boolean = true,
  isChord: boolean = false
  ): string[] {
  // Assicurati che scala non sia vuoto
  if (scala.data.length === 0) {
      return [];
  }
  //console.log("---> inizio script", scala.data, ita,useCents,"enam", checkEnharmonic,"isChord",isChord)
  const noteItaliane: string[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
  const noteInglesi: string[] = ["C", "D", "E", "F", "G", "A", "B"];
  const noteNames = ita ? noteItaliane : noteInglesi;
  const standard = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 12);
  const intervalStandard = new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);

  // Align scales
  let scales = lcmPosition(standard, scala);
  let lcmStandard = scales[0];
  let newScale = scales[1];

  // Correzione: Assicurati che newScale.data non sia vuoto
  if (newScale.data.length === 0) return [];
  // Correzione: Usa l'asserzione non-null (!) perché data non è vuoto
  const firstNoteNewScale = newScale.data[0]!;

  // Determine reference octave

  let index = 0;
  let finalScale = newScale;
  let rootOffset = 0; // Rinominato da 'root' per evitare confusione con la fondamentale
  const preDegrees = finalScale.getDegrees();
  let degrees = preDegrees;

  function fixIntervals(scale:positionVector, degrees: number[]){
    const intervalli = scale.getIntervalTypes();
    const sus4 : boolean = intervalli.some(tipoIntervallo => tipoIntervallo.startsWith("3aug"))
    const sus2 : boolean = intervalli.some(tipoIntervallo => tipoIntervallo.startsWith("3dim"))
    const dim7 : boolean = intervalli.some(tipoIntervallo => tipoIntervallo.startsWith("7dim"))
    if(sus4 ){
      for(let i = 0; i < degrees.length; i++){
        if(degrees[i] === 2){degrees[i] = 3}
      }
    }
    if(sus2 ){
      for(let i = 0; i < degrees.length; i++){
        if(degrees[i] === 2){degrees[i] = 1}
      }
    }
    if(dim7 ){
      for(let i = 0; i < degrees.length; i++){
        if(degrees[i] === 6){degrees[i] = 5}
      }
    }
  }
  fixIntervals(finalScale, degrees);

  if (isChord) {
    //console.log("hey sono dentro chord",isChord)
    //console.log("finalScale", finalScale.data, "mod ", finalScale.modulo)
    
    const root = getChordName(finalScale, true).root;
    //console.log("rooot" , root.data, "mod", root.modulo)
      // Trova la fondamentale del chord
      const rootDegreeResult = inverse_select(root, finalScale);
      //console.log("asdasda")
      //console.log("risultato della ricerca root",rootDegreeResult.data, "modulo", rootDegreeResult.modulo)
      // Correzione: Controlla che rootDegreeResult.data[0] esista
      const rootDegreeVal = rootDegreeResult.data[0];
      if (rootDegreeVal !== undefined && rootDegreeVal !== 0) {
          rootOffset = rootDegreeVal;
          //console.log("scala originaria",finalScale.data, "mod", finalScale.modulo)
          finalScale = finalScale.rototranslate(rootOffset, finalScale.data.length, false);
          //console.log("scala ruotata", finalScale.data, "mod", finalScale.modulo)
          degrees = finalScale.getDegrees()
          fixIntervals(finalScale, degrees);
          //console.log("nuovi post fix ruotati", degrees)

      } else {
          //console.warn("scaleNames (isChord): Could not determine root degree.");
      }
  }

  // Correzione: Assicurati che finalScale.data non sia vuoto
  if (finalScale.data.length === 0) return [];
  // Correzione: Usa l'asserzione non-null (!) perché data non è vuoto
  const firstNoteFinalScale = finalScale.data[0]!;

  // Trova l'indice di allineamento iniziale
  // Corretto: Usa < invece di &lt;
  if (lcmStandard.element(index) < firstNoteFinalScale) {
    // Corretto: Usa < invece di &lt;
    while (lcmStandard.element(index) < firstNoteFinalScale) {
      index++;
    }
    index--; // Torna indietro all'ultimo indice <= firstNoteFinalScale
  } else {
    // Corretto: Usa >= invece di &gt;=
    while (lcmStandard.element(index) >= firstNoteFinalScale) {
      index--;
    }
  }

  // Ottieni i gradi (assicurati che getDegrees restituisca number[])
  if (degrees.some(d => d === undefined)) {
      //console.warn("scaleNames: getDegrees returned undefined values.");
      degrees = degrees.map(d => d ?? 0); // Fallback a 0 per undefined
  }
  let noteDegrees = [...degrees];

  //console.log("noteDegrees arrivati              ",noteDegrees)
  let steps1: number[] = []; // Tipo esplicito
  let steps2: number[] = []; // Tipo esplicito
  let runningTotal1 = 0;
  let runningTotal2 = 0;
  //console.log("noteDegrees corretti per sus e dim",noteDegrees)
  for (let i = 0; i < finalScale.data.length; i++) {
    // Correzione: Usa l'asserzione non-null (!) perché 'i' è entro i limiti
    const finalScaleNote = finalScale.data[i]!;
    const noteDeg = noteDegrees[i]!;
    const oct = Math.floor((finalScaleNote - firstNoteFinalScale) / finalScale.modulo) * 7;

    //console.log("nota puntata", finalScaleNote, lcmStandard.element(noteDeg + index + oct ),lcmStandard.element(noteDeg + index + oct+1 ), "noteDegree",noteDeg)
    // Calcola deviazioni
    const step1Val = finalScaleNote - lcmStandard.element(noteDeg + index + oct );
    steps1[i] = step1Val;
    runningTotal1 += step1Val;

    const step2Val = finalScaleNote - lcmStandard.element(noteDeg + index + oct +1);
    steps2[i] = step2Val;
    runningTotal2 += step2Val;
  }
  //console.log("steps1  : ", steps1,"\n        steps2  : ", steps2);

  // Scegli il set migliore
  // Corretto: Usa <= invece di &lt;=
  let steps = Math.abs(runningTotal1) <= Math.abs(runningTotal2) ? steps1 : steps2;
  // Corretto: Usa > invece di &gt;
  if (Math.abs(runningTotal1) > Math.abs(runningTotal2)) index++;


  //console.log("steps  : ", steps, "degree  : " , noteDegrees)

  // Controllo enarmonico
    if (checkEnharmonic) {
    // Corretto: Usa < invece di &lt;
    for (let i = 0; i < steps.length; i++) {
      // Correzione: Usa l'asserzione non-null (!) perché 'i' è entro i limiti
      const currentStep = steps[i]!;
      const currentDegree = noteDegrees[i]!;

      // Intervallo standard per salire al grado successivo
      const intervalUp = intervalStandard.element(currentDegree + index );
      // Intervallo standard per scendere al grado precedente
      const intervalDown = intervalStandard.element(currentDegree + index - 1);

      // Se la deviazione positiva è >= all'intervallo per salire,
      // la nota è enarmonicamente più vicina (o uguale) al grado successivo.
      // Corretto: Usa >= invece di &gt;= e === invece di ==
      if (Math.abs(currentStep) >= intervalUp && Math.sign(currentStep) === +1) {
        // Ricalcola la deviazione rispetto al grado successivo
        steps[i] = currentStep - intervalUp;
        // Assegna il grado successivo
        noteDegrees[i] = currentDegree + 1;
      // Se la deviazione negativa è >= all'intervallo per scendere (in valore assoluto),
      // la nota è enarmonicamente più vicina (o uguale) al grado precedente.
      // Corretto: Usa >= invece di &gt;= e === invece di ==
      } else if (Math.abs(currentStep) >= intervalDown && Math.sign(currentStep) === -1) {
        // Ricalcola la deviazione rispetto al grado precedente (aggiungendo intervalDown perché currentStep è negativo)
        steps[i] = currentStep + intervalDown;
        // Assegna il grado precedente
        noteDegrees[i] = currentDegree - 1;
      }
    }
      //console.log("noteDegrees if checkEnam",noteDegrees)

  }
  // Genera nomi finali
  let names: string[] = new Array(noteDegrees.length); // Inizializza con la lunghezza corretta
  // Corretto: Usa < invece di &lt;
  for (let i = 0; i < noteDegrees.length; i++) {
    const j = modulo(i - rootOffset, steps.length); // Usa rootOffset calcolato
    // Correzione: Usa l'asserzione non-null (!) perché 'j' è valido
    const actualStep = steps[j]!;
    const actualDegree = noteDegrees[j]!;
    // Correzione: Usa l'asserzione non-null (!) perché l'indice modulo 7 è valido
    const actualBaseName = noteNames[modulo(actualDegree + index, 7)]!;
    //console.log("index ", index,"actual Degree ", `${actualDegree} ${actualStep}` , "mod" , modulo(actualDegree + index, 7),  "name " , actualBaseName)

    let finalName: string;
    if (useCents) {
      const cents = Math.round(actualStep * 50);
      // Corretto: Usa !== invece di !=
      if (cents !== 0) {
        // Corretto: Usa > invece di &gt;
        finalName = `${actualBaseName} ${cents > 0 ? "\u2191" : "\u2193"}${Math.abs(cents)}\u00a2`;
      } else {
        finalName = actualBaseName;
      }
    } else {
      const roundedSteps = Math.round(actualStep);
      // Corretto: Usa < invece di &lt; e !== invece di !=
      if (Math.abs(actualStep) < 1 && actualStep !== 0) {
        // Corretto: Usa > invece di &gt;
        finalName = actualBaseName + (actualStep > 0 ? "\uD834\uDD32" : "\uD834\uDD33"); // Simboli microtonali
      // Corretto: Usa !== invece di !=
      } else if (roundedSteps !== 0) {
        // Corretto: Usa > invece di &gt;
        const alteration = roundedSteps > 0 ? "\u266F" : "\u266D"; // Diesis o bemolle
        finalName = actualBaseName + alteration.repeat(Math.min(Math.abs(roundedSteps), 2)); // Max 2 alterazioni
      } else {
        finalName = actualBaseName;
      }
    }
    // Correzione: Assegna a names[i] invece di usare push potenzialmente fuori ordine
    names[i] = finalName;
  }
  //console.log("finee ------------------------------------------------------------")
  return names;
}
