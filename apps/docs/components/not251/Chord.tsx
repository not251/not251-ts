"use client";
import {
  chord as generateChord,
  positionVector,
  intervalVector,
} from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext";
import { renderSlider, renderCheckbox } from "./formUtils";

interface ChordParams {
  scala: positionVector;
  grado: number;
  selection?: positionVector | intervalVector;
  preVoices: number;
  position: number;
  postVoices: number;
  isInvert: boolean;
  isNegative: boolean;
  negativePos: number;
  standardNegative: boolean;
  root?: number;
  octave: number;
}

export default function Chord() {
  const { setNotes, scala } = usePlaygroundContext();
  const defaultValues = {
    scala,
    octave: 2,
    grado: 0,
    position: 0,
    preVoices: 3,
    postVoices: 3,
    isInvert: false,
    isNegative: false,
    standardNegative: false,
    negativePos: 0,
    selection: undefined,
    root: undefined,
  };

  const [params, setParams] = useState<ChordParams>(defaultValues);

  // Update scala when it changes in context
  useEffect(() => {
    setParams((prev) => ({ ...prev, scala }));
  }, [scala]);

  // Generate chord whenever any parameter changes
  useEffect(() => {
    const chordParams = {
      ...params,
      preVoices: Math.max(0, params.preVoices),
      postVoices: Math.max(0, params.postVoices),
    };
    try {
      const newChordNotes = generateChord(chordParams);
      setNotes(newChordNotes);
    } catch (error) {
      // Reset to default values if there's an error
      setParams(defaultValues);
    }
  }, [params, setNotes]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Chord</h2>
      {renderSlider({
        id: "octave",
        label: "Octave",
        max: 8,
        min: 0,
        params,
        setParams,
      })}
      {renderSlider({ id: "grado", label: "Grado", max: 7, params, setParams })}
      {renderSlider({
        id: "position",
        label: "Position",
        max: 7,
        params,
        setParams,
      })}
      {renderSlider({
        id: "preVoices",
        label: "Pre Voices",
        max: 7,
        min: 1,
        params,
        setParams,
      })}
      {renderSlider({
        id: "postVoices",
        label: "Post Voices",
        max: 7,
        min: 1,
        params,
        setParams,
      })}
      {renderCheckbox({ id: "isInvert", label: "Invert", params, setParams })}
      {renderCheckbox({
        id: "isNegative",
        label: "Negative",
        params,
        setParams,
      })}
      {renderCheckbox({
        id: "standardNegative",
        label: "Standard Negative",
        params,
        setParams,
      })}
      {renderSlider({
        id: "negativePos",
        label: "Negative Pos",
        max: 11,
        params,
        setParams,
      })}
    </div>
  );
}
