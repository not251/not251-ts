"use client";
import { chord as generateChord, positionVector } from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext"; // Import context hook

function generateChordNotes(
  scala: positionVector,
  grado: number,
  octave: number,
  position: number,
  preVoices: number,
  postVoices: number,
  isInvert: boolean,
  isNegative: boolean,
  standardNegative: boolean,
  negativePos: number
) {
  const chordNotes: positionVector = generateChord({
    scala: scala, // Use scala from context
    octave: octave,
    grado: grado,
    position: position,
    preVoices: preVoices,
    postVoices: postVoices,
    isInvert: isInvert,
    isNegative: isNegative,
    standardNegative: standardNegative,
    negativePos: negativePos,
  });
  return chordNotes;
}

export default function Chord() {
  const { setNotes, scala } = usePlaygroundContext(); // Get scala from context

  // State for chord parameters
  const [octave, setOctave] = useState<number>(2);
  const [grado, setGrado] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [preVoices, setPreVoices] = useState<number>(3);
  const [postVoices, setPostVoices] = useState<number>(3);
  const [isInvert, setIsInvert] = useState<boolean>(false);
  const [isNegative, setIsNegative] = useState<boolean>(false);
  const [standardNegative, setStandardNegative] = useState<boolean>(false);
  const [negativePos, setNegativePos] = useState<number>(0);

  // State for the generated chord notes
  const [chordNotes, setChordNotes] = useState<positionVector>(
    generateChordNotes(
      scala,
      grado,
      octave,
      position,
      preVoices,
      postVoices,
      isInvert,
      isNegative,
      standardNegative,
      negativePos
    )
  );

  // Update the context and regenerate chord notes when parameters change
  useEffect(() => {
    const newChordNotes = generateChordNotes(
      scala,
      grado,
      octave,
      position,
      preVoices,
      postVoices,
      isInvert,
      isNegative,
      standardNegative,
      negativePos
    );
    setChordNotes(newChordNotes);
    setNotes(newChordNotes); // Update context
  }, [
    scala,
    grado,
    octave,
    position,
    preVoices,
    postVoices,
    isInvert,
    isNegative,
    standardNegative,
    negativePos,
    setNotes,
  ]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Chord</h2>

      {/* Octave Slider */}
      <div className="flex items-center space-x-2">
        <label>Octave:</label>
        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={octave}
          onChange={(e) => setOctave(Number(e.target.value))}
          className="w-32"
        />
        <span>{octave - 1}</span>
      </div>

      {/* Octave Slider */}
      <div className="flex items-center space-x-2">
        <label>Grado:</label>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={grado}
          onChange={(e) => setGrado(Number(e.target.value))}
          className="w-32"
        />
        <span>{grado + 1}</span>
      </div>

      {/* Position Slider */}
      <div className="flex items-center space-x-2">
        <label>Position:</label>
        <input
          type="range"
          min={0}
          max={7}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-32"
        />
        <span>{position}</span>
      </div>

      {/* Pre Voices Slider */}
      <div className="flex items-center space-x-2">
        <label>Pre Voices:</label>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={preVoices}
          onChange={(e) => setPreVoices(Number(e.target.value))}
          className="w-32"
        />
        <span>{preVoices}</span>
      </div>

      {/* Post Voices Slider */}
      <div className="flex items-center space-x-2">
        <label>Post Voices:</label>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={postVoices}
          onChange={(e) => setPostVoices(Number(e.target.value))}
          className="w-32"
        />
        <span>{postVoices}</span>
      </div>

      {/* Invert Checkbox */}
      <div className="flex items-center space-x-2">
        <label>Invert:</label>
        <input
          type="checkbox"
          checked={isInvert}
          onChange={(e) => setIsInvert(e.target.checked)}
        />
      </div>

      {/* Negative Checkbox */}
      <div className="flex items-center space-x-2">
        <label>Negative:</label>
        <input
          type="checkbox"
          checked={isNegative}
          onChange={(e) => setIsNegative(e.target.checked)}
        />
      </div>

      {/* Standard Negative Checkbox */}
      <div className="flex items-center space-x-2">
        <label>Standard Negative:</label>
        <input
          type="checkbox"
          checked={standardNegative}
          onChange={(e) => setStandardNegative(e.target.checked)}
        />
      </div>

      {/* Negative Position Slider */}
      <div className="flex items-center space-x-2">
        <label>Negative Position:</label>
        <input
          type="range"
          min={0}
          max={11}
          step={1}
          value={negativePos}
          onChange={(e) => setNegativePos(Number(e.target.value))}
          className="w-32"
        />
        <span>{negativePos}</span>
      </div>
    </div>
  );
}
