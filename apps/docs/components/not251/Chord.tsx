"use client";
import { chord as generateChord, positionVector } from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext"; // Import context hook

function generateChordNotes(
  scala: positionVector,
  octave: number = 0,
  postVoices: number = 3
) {
  const chordNotes: positionVector = generateChord({
    scala: scala, // Use scala from context
    octave: octave,
    preVoices: 3,
    position: 0,
    postVoices: postVoices,
    isInvert: false,
    isNegative: false,
    standardNegative: false,
    negativePos: 0,
  });
  return chordNotes;
}

export default function Chord() {
  const { setNotes, scala } = usePlaygroundContext(); // Get scala from context
  const [chordNotes, setChordNotes] = useState<positionVector>(
    generateChordNotes(scala)
  );

  // Update the context whenever chordNotes changes
  useEffect(() => {
    setNotes(chordNotes);
  }, [chordNotes, setNotes]);

  return (
    <div>
      <button onClick={() => setChordNotes(generateChordNotes(scala, 1, 5))}>
        Generate Chord
      </button>
      <pre>{JSON.stringify(chordNotes.data, null, 2)}</pre>
    </div>
  );
}
