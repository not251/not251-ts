import { intervalVector, lcmInterval } from "./intervalVector";
import { positionVector, lcmPosition } from "./positionVector";
import { ScaleParams, defaultScaleParams, scale, autoMode } from "./scale";
import {
  ChordParams,
  defaultChordParams,
  chord,
  autoVoicing,
  autovoicingP2P,
  blockChord,
  spread,
  VoiceRange,
  VoiceRanges,
  getChordName,
} from "./chord";
//import { autoGrado, autoRoot } from "./auto";
import { transpose } from "./quantize";
import {
  selectFromInterval,
  toIntervals,
  toPositions,
  names,
} from "./crossOperation";
import { grid } from "./grid";
import { generateCounterpoint } from "./counterpoint";
import { phraseLength, tihai } from "./indian";
import * as distances from "./distances";
import * as utility from "./utility";
import * as mirror from "./mirror";
import { Language, NoteNames } from "./constants";

export {
  autoMode,
  autoVoicing,
  autovoicingP2P,
  blockChord,
  getChordName,
  spread,
  VoiceRange,
  VoiceRanges,
  ChordParams,
  defaultChordParams,
  chord,
  distances,
  utility,
  Language,
  NoteNames,
  ScaleParams,
  defaultScaleParams,
  scale,
  names,
  transpose,
  selectFromInterval,
  toIntervals,
  toPositions,
  intervalVector,
  positionVector,
  grid,
  mirror,
  generateCounterpoint,
  tihai,
  phraseLength,
  lcmPosition,
};
