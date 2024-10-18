"use client";
import {
  scale as generateScale,
  intervalVector,
  positionVector,
} from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext"; // Import the context

function generateScaleNotes(
  grado: number = 0,
  modo: number = 0,
  root: number = 0
) {
  const scaleNotes = generateScale({
    intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
    grado: grado,
    root: root,
    modo: modo,
    isInvert: false,
    isMirror: false,
    mirrorLeft: false,
    mirrorPos: 0,
  });
  return scaleNotes;
}

export default function Scale() {
  const { setScala } = usePlaygroundContext(); // Get setNotes and setScala from context
  const [scaleNotes, setScaleNotes] =
    useState<positionVector>(generateScaleNotes());

  // Update the context whenever scaleNotes changes
  useEffect(() => {
    setScala(scaleNotes); // Set scala to the same value for chord use
  }, [scaleNotes, setScala]);

  return (
    <div>
      <button onClick={() => setScaleNotes(generateScaleNotes(1, 0, 0))}>
        Generate Scale
      </button>
      <pre>{JSON.stringify(scaleNotes.data, null, 2)}</pre>
    </div>
  );
}
