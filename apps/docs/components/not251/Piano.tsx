"use client";
import React from "react";
import { usePlaygroundContext } from "./PlaygroundContext"; // Correct the context import

interface PianoKeyboardProps {
  startNote?: number;
  endNote?: number;
}

const noteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export default function Piano({
  startNote = 12,
  endNote = 59,
}: PianoKeyboardProps) {
  const { notes } = usePlaygroundContext(); // Get notes from context

  const isBlackKey = (note: number) => {
    return [1, 3, 6, 8, 10].includes(note % 12);
  };

  const getNoteNameAndOctave = (midiNumber: number) => {
    const noteName = noteNames[midiNumber % 12];
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${noteName}${octave}`;
  };

  const renderKey = (midiNumber: number) => {
    const isBlack = isBlackKey(midiNumber);
    const isActive = notes.data.includes(midiNumber); // Access the context notes correctly
    const noteNameAndOctave = getNoteNameAndOctave(midiNumber);

    return (
      <div
        key={midiNumber}
        className={`inline-block ${isBlack ? "w-6 h-32 -mx-3 z-10" : "w-10 h-48"} ${
          isActive
            ? isBlack
              ? "bg-gray-600"
              : "bg-gray-400"
            : isBlack
              ? "bg-black"
              : "bg-white"
        } border border-gray-300 ${isBlack ? "rounded-b" : "rounded-b-lg"} cursor-pointer relative`}
      >
        {isActive && (
          <span
            className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs ${
              isBlack ? "text-white" : "text-black"
            }`}
          >
            {noteNameAndOctave}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative flex justify-center">
        {Array.from(
          { length: endNote - startNote + 1 },
          (_, i) => startNote + i
        ).map(renderKey)}
      </div>
    </div>
  );
}
