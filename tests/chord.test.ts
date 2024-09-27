import not251 from "../src";

describe("chord", () => {
  //C Major from intervals and positions
  it("should create a C Major chord", () => {
    let chordIntervals = new not251.intervalVector([2], 12, 0);
    let chordPositions = new not251.positionVector([0, 2, 4], 12, 12);
    let intervalVector = new not251.intervalVector(
      [2, 2, 1, 2, 2, 2, 1],
      12,
      0
    );
    let scale = not251.scale(intervalVector, 0, 0, 0, false, false, 0);
    let chord1 = not251.chordFromInterval(
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
    let chord2 = not251.chordFromPosition(
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
