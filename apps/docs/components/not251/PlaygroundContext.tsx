"use client";

import React, { createContext, useContext, useState } from "react";
import { positionVector } from "@not251/not251";

// Define the context value type
interface PlaygroundContextType {
  notes: positionVector;
  setNotes: React.Dispatch<React.SetStateAction<positionVector>>;
  scala: positionVector; // Add scala parameter
  setScala: React.Dispatch<React.SetStateAction<positionVector>>;
}

// Create the context
const PlaygroundContext = createContext<PlaygroundContextType | undefined>(
  undefined
);

// Custom hook to use the context
export const usePlaygroundContext = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error(
      "usePlaygroundContext must be used within a PlaygroundProvider"
    );
  }
  return context;
};

// Playground provider component
export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initVector = new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 0);
  const [notes, setNotes] = useState<positionVector>(initVector);
  const [scala, setScala] = useState<positionVector>(initVector); // Manage scala state

  return (
    <PlaygroundContext.Provider value={{ notes, setNotes, scala, setScala }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
