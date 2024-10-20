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
const MIDI_C0 = 12;

export default function Piano() {
  const { notes } = usePlaygroundContext();

  const activeNotes = notes.data.sort((a, b) => a - b);
  const minOctave = Math.max(
    0,
    Math.floor((Math.min(...activeNotes, MIDI_C0) - MIDI_C0) / 12)
  );
  const maxOctave = Math.max(
    minOctave + 1,
    Math.ceil((Math.max(...activeNotes, MIDI_C0 + 11) - MIDI_C0) / 12)
  );

  const startNote = MIDI_C0 + minOctave * 12;
  const endNote = MIDI_C0 + maxOctave * 12 + 11;

  const isBlackKey = (note: number) =>
    [1, 3, 6, 8, 10].includes((note - MIDI_C0) % 12);
  const getNoteNameAndOctave = (midiNumber: number) =>
    `${noteNames[(midiNumber - MIDI_C0) % 12]}${Math.floor((midiNumber - MIDI_C0) / 12)}`;

  const renderKey = (midiNumber: number) => (
    <div
      key={midiNumber}
      className={`relative inline-flex justify-center items-end
        ${isBlackKey(midiNumber) ? "bg-black h-32 w-8 -mx-4 z-10" : "bg-white h-48 w-12"} 
        ${notes.data.includes(midiNumber) ? "bg-opacity-60" : ""}
        border border-gray-300 rounded-b`}
    >
      {notes.data.includes(midiNumber) && (
        <span
          className={`absolute bottom-1 text-xs ${isBlackKey(midiNumber) ? "text-white" : "text-black"}`}
        >
          {getNoteNameAndOctave(midiNumber)}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 overflow-x-auto">
      <div className="relative inline-flex">
        {Array.from(
          { length: endNote - startNote + 1 },
          (_, i) => startNote + i
        ).map(renderKey)}
      </div>
    </div>
  );
}
