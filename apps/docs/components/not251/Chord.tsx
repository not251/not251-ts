"use client";
import { chord as generateChord, positionVector } from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext";
import { renderSlider, renderCheckbox } from "./formUtils";

function generateChordNotes(params: {
  scala: positionVector;
  grado: number;
  octave: number;
  position: number;
  preVoices: number;
  postVoices: number;
  isInvert: boolean;
  isNegative: boolean;
  standardNegative: boolean;
  negativePos: number;
}) {
  return generateChord(params);
}

export default function Chord() {
  const { setNotes, scala } = usePlaygroundContext();
  const [params, setParams] = useState({
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
  });

  useEffect(() => {
    const newChordNotes = generateChordNotes({ ...params, scala });
    setNotes(newChordNotes);
  }, [params, scala, setNotes]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Chord</h2>
      {renderSlider({ name: "Octave", max: 3, params, setParams })}
      {renderSlider({ name: "Grado", max: 7, params, setParams })}
      {renderSlider({ name: "Position", max: 7, params, setParams })}
      {renderSlider({ name: "PreVoices", max: 7, params, setParams })}
      {renderSlider({ name: "PostVoices", max: 7, params, setParams })}
      {renderCheckbox({ name: "Invert", params, setParams })}
      {renderCheckbox({ name: "Negative", params, setParams })}
      {renderCheckbox({ name: "StandardNegative", params, setParams })}
      {renderSlider({ name: "NegativePos", max: 11, params, setParams })}
    </div>
  );
}
