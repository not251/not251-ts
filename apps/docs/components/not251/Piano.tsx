"use client";
import { usePlaygroundContext } from "./PlaygroundContext";

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

export default function Piano({ startNote = 12, endNote = 59 }) {
  const { notes } = usePlaygroundContext();

  const isBlackKey = (note: number) => [1, 3, 6, 8, 10].includes(note % 12);
  const getNoteNameAndOctave = (midiNumber: number) =>
    `${noteNames[midiNumber % 12]}${Math.floor(midiNumber / 12) - 1}`;

  const renderKey = (midiNumber: number) => {
    const isBlack = isBlackKey(midiNumber);
    const isActive = notes.data.includes(midiNumber);

    return (
      <div
        key={midiNumber}
        className={`inline-block ${isBlack ? "w-6 h-32 -mx-3 z-10" : "w-10 h-48"} 
        ${isActive ? (isBlack ? "bg-gray-600" : "bg-gray-400") : isBlack ? "bg-black" : "bg-white"} 
        border border-gray-300 ${isBlack ? "rounded-b" : "rounded-b-lg"} cursor-pointer relative`}
      >
        {isActive && (
          <span
            className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs 
            ${isBlack ? "text-white" : "text-black"}`}
          >
            {getNoteNameAndOctave(midiNumber)}
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
