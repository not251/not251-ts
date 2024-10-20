"use client";
import { scale as generateScale, intervalVector } from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext";
import { renderSlider, renderCheckbox } from "./formUtils";

function generateScaleNotes(params: {
  grado: number;
  modo: number;
  root: number;
  isInvert: boolean;
  isMirror: boolean;
  mirrorLeft: boolean;
  mirrorPos: number;
}) {
  return generateScale({
    intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
    ...params,
  });
}

export default function Scale() {
  const { setScala } = usePlaygroundContext();
  const [params, setParams] = useState({
    grado: 0,
    modo: 0,
    root: 0,
    isInvert: false,
    isMirror: false,
    mirrorLeft: false,
    mirrorPos: 0,
  });

  useEffect(() => {
    const newScaleNotes = generateScaleNotes(params);
    setScala(newScaleNotes);
  }, [params, setScala]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Scale</h2>
      {renderSlider({ name: "Modo", max: 7, params, setParams })}
      {renderSlider({ name: "Grado", max: 7, params, setParams })}
      {renderSlider({ name: "Root", max: 11, params, setParams })}
      {renderCheckbox({ name: "Invert", params, setParams })}
      {renderCheckbox({ name: "Mirror", params, setParams })}
      {renderCheckbox({ name: "MirrorLeft", params, setParams })}
      {renderSlider({ name: "MirrorPos", max: 11, params, setParams })}
    </div>
  );
}
