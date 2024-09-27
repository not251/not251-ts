import * as MyIV from "../src/IntervalVector";
import * as MyPV from "../src/PositionVector";
import * as MyScale from "../src/Scale";
import * as MyChord from "../src/Chord";

describe("Chord", () => {
  //C Major from intervals and positions
  it("should create a C Major chord", () => {
    let chordIntervals = new MyIV.IntervalVector([2], 12, 0);
    let chordPositions = new MyPV.PositionVector([0, 2, 4], 12, 12);
    let intervalVector = new MyIV.IntervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);
    let scale = MyScale.scale(intervalVector, 0, 0, 0, false, false, 0);
    let chord1 = MyChord.chordFromInterval(
      scale,
      0,
      chordIntervals,
      3,
      0,
      3,
      false,
      false,
      10,
      false,
      0,
      0
    );
    let chord2 = MyChord.chordFromPosition(
      scale,
      0,
      chordPositions,
      3,
      0,
      3,
      false,
      false,
      10,
      false,
      0,
      0
    );
    expect(chord1.data).toEqual([0, 4, 7]);
    expect(chord2.data).toEqual([0, 4, 7]);
  });
});
