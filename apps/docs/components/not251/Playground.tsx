import Chord from "./Chord";
import Piano from "./Piano";
import Scale from "./Scale";
import { PlaygroundProvider } from "./PlaygroundContext";

export const Playground = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-center text-4xl font-semibold">Playground</h1>
      <PlaygroundProvider>
        <Piano />
        <div className="flex flex-row items-start gap-4">
          <Scale />
          <Chord />
        </div>
      </PlaygroundProvider>
    </div>
  );
};
