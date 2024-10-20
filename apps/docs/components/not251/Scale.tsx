"use client";
import {
  scale as generateScale,
  intervalVector,
  positionVector,
} from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext"; // Import the context

function generateScaleNotes(
  grado: number,
  modo: number,
  root: number,
  isInvert: boolean,
  isMirror: boolean,
  mirrorLeft: boolean,
  mirrorPos: number
) {
  const scaleNotes = generateScale({
    intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
    grado: grado,
    root: root,
    modo: modo,
    isInvert: isInvert,
    isMirror: isMirror,
    mirrorLeft: mirrorLeft,
    mirrorPos: mirrorPos,
  });
  return scaleNotes;
}

export default function Scale() {
  const { setScala } = usePlaygroundContext(); // Get setScala from context

  // State for scale parameters
  const [grado, setGrado] = useState<number>(0);
  const [modo, setModo] = useState<number>(0);
  const [root, setRoot] = useState<number>(0);
  const [isInvert, setIsInvert] = useState<boolean>(false);
  const [isMirror, setIsMirror] = useState<boolean>(false);
  const [mirrorLeft, setMirrorLeft] = useState<boolean>(false);
  const [mirrorPos, setMirrorPos] = useState<number>(0);

  // State for the generated scale notes
  const [scaleNotes, setScaleNotes] = useState<positionVector>(
    generateScaleNotes(
      grado,
      modo,
      root,
      isInvert,
      isMirror,
      mirrorLeft,
      mirrorPos
    )
  );

  // Update the context and regenerate scale notes when parameters change
  useEffect(() => {
    const newScaleNotes = generateScaleNotes(
      grado,
      modo,
      root,
      isInvert,
      isMirror,
      mirrorLeft,
      mirrorPos
    );
    setScaleNotes(newScaleNotes);
    setScala(newScaleNotes); // Update context
  }, [grado, modo, root, isInvert, isMirror, mirrorLeft, mirrorPos, setScala]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Scale</h2>
      {/* Modo Slider */}
      <div className="flex items-center space-x-2">
        <label>Modo:</label>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={modo}
          onChange={(e) => setModo(Number(e.target.value))}
          className="w-32"
        />
        <span>{modo + 1}</span>
      </div>

      {/* Grado Slider */}
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

      {/* Root Slider */}
      <div className="flex items-center space-x-2">
        <label>Root:</label>
        <input
          type="range"
          min={0}
          max={11}
          step={1}
          value={root}
          onChange={(e) => setRoot(Number(e.target.value))}
          className="w-32"
        />
        <span>{root}</span>
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

      {/* Mirror Checkbox */}
      <div className="flex items-center space-x-2">
        <label>Mirror:</label>
        <input
          type="checkbox"
          checked={isMirror}
          onChange={(e) => setIsMirror(e.target.checked)}
        />
      </div>

      {/* Mirror Left Checkbox */}
      <div className="flex items-center space-x-2">
        <label>Mirror Left:</label>
        <input
          type="checkbox"
          checked={mirrorLeft}
          onChange={(e) => setMirrorLeft(e.target.checked)}
        />
      </div>

      {/* Mirror Position Slider */}
      <div className="flex items-center space-x-2">
        <label>Mirror Position:</label>
        <input
          type="range"
          min={0}
          max={11}
          step={1}
          value={mirrorPos}
          onChange={(e) => setMirrorPos(Number(e.target.value))}
          className="w-32"
        />
        <span>{mirrorPos}</span>
      </div>
    </div>
  );
}
