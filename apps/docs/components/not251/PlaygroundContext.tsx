"use client";
import React, { createContext, useContext, useState } from "react";
import { positionVector } from "@not251/not251";

interface PlaygroundContextType {
  notes: positionVector;
  setNotes: React.Dispatch<React.SetStateAction<positionVector>>;
  scala: positionVector;
  setScala: React.Dispatch<React.SetStateAction<positionVector>>;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(
  undefined
);

export const usePlaygroundContext = () => {
  const context = useContext(PlaygroundContext);
  if (!context)
    throw new Error(
      "usePlaygroundContext must be used within a PlaygroundProvider"
    );
  return context;
};

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const defaultScala = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 0);
  const defaultNotes = new positionVector(
    defaultScala.data,
    defaultScala.modulo,
    0
  );

  const [notes, setNotes] = useState<positionVector>(defaultNotes);
  const [scala, setScala] = useState<positionVector>(defaultScala);

  return (
    <PlaygroundContext.Provider value={{ notes, setNotes, scala, setScala }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
