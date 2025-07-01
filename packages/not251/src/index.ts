// Import values (functions, classes, objects, constants)
import { intervalVector, lcmInterval } from "./intervalVector";
import { positionVector, lcmPosition, inverse_select } from "./positionVector"; // Aggiunto inverse_select se necessario esportarlo
import { defaultScaleParams, scale, autoMode, ScaleParams as ScaleParamsValue } from "./scale"; // 'scale' è la funzione, ScaleParamsValue è l'oggetto default
import {
  defaultChordParams,
  chord, // 'chord' è la funzione
  autoVoicing,
  autovoicingP2P,
  blockChord,
  spread,
  VoiceRanges, // 'VoiceRanges' è la costante array
  getChordName,
  scaleNames as scaleNames, // Rinominato per evitare conflitto con quello da crossOperation
  VoiceRange as VoiceRangeValue // 'VoiceRange' è la classe
} from "./chord";
// import { autoGrado, autoRoot } from "./auto"; // Mantenuto commentato
import { transpose, quantize } from "./quantize"; // Aggiunto quantize se necessario
import {
  selectFromInterval,
  toIntervals,
  toPositions,
  //names as crossOperationNames, // Rinominato per evitare conflitto
} from "./crossOperation";
import { grid, subdiv, recursiveInsert, insertAtMidpoint } from "./grid"; // Aggiunte funzioni da grid se necessario
//import { generateCounterpoint, invertMelody, analyzeMelody, reconstructNotes, durationScaler, rhythmScaler } from "./counterpoint"; // Aggiunte funzioni da counterpoint
import { phraseLength, tihai, tihaiGenerator, tihaiReader } from "./indian"; // Aggiunte funzioni da indian
import * as distances from "./distances"; // Exporting the whole module
import * as utility from "./utility";     // Exporting the whole module
import * as mirror from "./mirror";       // Exporting the whole module
import { findScaleName , scalePool as scalePool} from "./ScaleNames"; // <-- ASSICURATI CHE findScaleName SIA ESPORTATO IN ScaleNames.ts
import { adaptScale } from "./autoScale"; // Importa da autoScale
import { binaryVector } from "./binaryVector"; // <-- ASSICURATI CHE binaryVector SIA ESPORTATO IN binaryVector.ts

// Import types
import type { ScaleParams as ScaleParamsType } from "./scale"; // Alias per il tipo
import type { ChordParams as ChordParamsType, VoiceRange as VoiceRangeType, SpreadResult } from "./chord"; // Alias per i tipi
import type { Language as LanguageType, NoteNames as NoteNamesType, AlteredNoteName, Note } from "./constants"; // Alias e altri tipi
import type { distanceMapElement, distanceMap, optionMatrixElement, optionMatrix } from "./distances"; // Tipi da distances
import type { autoGradoMapElement, autoGradoMap } from "./auto"; // Tipi da auto (se usati)
import type { ScalePoolEntry } from "./ScaleNames";

// Export values
export {
  // Core classes and functions
  intervalVector,
  lcmInterval,
  positionVector,
  lcmPosition,
  binaryVector,
  scale, // function
  chord, // function
  // Scale related
  defaultScaleParams,
  ScaleParamsType, // default object
  autoMode,
  adaptScale,
  findScaleName, // from ScaleNames.ts
  scalePool,
  // Chord related
  defaultChordParams,
  autoVoicing,
  autovoicingP2P,
  blockChord,
  spread,
  VoiceRanges, // constant array
  VoiceRangeValue, // class
  getChordName,
  scaleNames, // from chord.ts
  // Quantization & Transposition
  transpose,
  quantize,
  // Cross Operations & Naming
  selectFromInterval,
  toIntervals,
  toPositions,
  //crossOperationNames, // from crossOperation.ts
  inverse_select,
  // Grid & Patterns
  grid,
  subdiv,
  recursiveInsert,
  insertAtMidpoint,
  // Counterpoint
  //generateCounterpoint,
  //invertMelody,
  //analyzeMelody,
  //reconstructNotes,
  //durationScaler,
  //rhythmScaler,
  // Indian Rhythms
  tihai,
  tihaiGenerator,
  tihaiReader,
  phraseLength,
  // Modules
  distances,
  utility,
  mirror,
  SpreadResult
};

// Export types using 'export type'
export type {
  ScaleParamsType as ScaleParams,
  ChordParamsType as ChordParams,
  VoiceRangeType as VoiceRange,
  LanguageType as Language,
  NoteNamesType as NoteNames,
  AlteredNoteName,
  Note,
  distanceMapElement,
  distanceMap,
  optionMatrixElement,
  optionMatrix,
  autoGradoMapElement,
  autoGradoMap,
  ScalePoolEntry,
};
