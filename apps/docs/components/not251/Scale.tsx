"use client";
import { scale as generateScale, intervalVector } from "@not251/not251";
import { useState, useEffect } from "react";
import { usePlaygroundContext } from "./PlaygroundContext";
import { renderSlider, renderCheckbox } from "./formUtils";

export default function Scale() {
  const { setScala } = usePlaygroundContext();
  const [params, setParams] = useState({
    intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
    grado: 0,
    modo: 0,
    root: 0,
    isInvert: false,
    isMirror: false,
    mirrorLeft: false,
    mirrorPos: 0,
  });

  useEffect(() => {
    const newScaleNotes = generateScale(params);
    setScala(newScaleNotes);
  }, [params, setScala]);

  return (
    <div className="flex flex-col items-start space-y-4 border border-white p-4 rounded-lg">
      <h2 className="text-2xl">Scale</h2>
      {renderSlider({ id: "modo", label: "Modo", max: 7, params, setParams })}
      {renderSlider({ id: "grado", label: "Grado", max: 7, params, setParams })}
      {renderSlider({ id: "root", label: "Root", max: 11, params, setParams })}
      {renderCheckbox({ id: "isInvert", label: "Invert", params, setParams })}
      {renderCheckbox({ id: "isMirror", label: "Mirror", params, setParams })}
      {renderCheckbox({
        id: "mirrorLeft",
        label: "Mirror Left",
        params,
        setParams,
      })}
      {renderSlider({
        id: "mirrorPos",
        label: "Mirror Position",
        max: 11,
        params,
        setParams,
      })}
    </div>
  );
}
