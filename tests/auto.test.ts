import * as MyIV from "../src/IntervalVector";
import * as MyPV from "../src/PositionVector";
import * as MyScale from "../src/Scale";
import * as MyChord from "../src/Chord";
import * as MyAuto from "../src/Auto";
import * as MyQuantize from "../src/Quantize";

describe("AutoVoicing", () => {
  //First degree to fourth degree
  it("should autovoice the two chords", () => {
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

    let chord2 = MyChord.chordFromInterval(
      scale,
      4,
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

    let out = MyAuto.autoVoicing(chord1, chord2);

    expect(chord1.data).toEqual([0, 4, 7]);
    expect(chord2.data).toEqual([7, 11, 14]);
    expect(out.pv.data).toEqual([-1, 2, 7]);
    expect(out.inversion).toEqual(-2);
  });
});

describe("AutoMode", () => {
  //AutoMode from one semitone out
  it("should rotate scale to mode 1", () => {
    let intervalVector = new MyIV.IntervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);
    let out = MyAuto.autoMode(
      intervalVector,
      new MyPV.PositionVector([61], 12, 12)
    );
    expect(out.data.data).toEqual([0, 1, 3, 5, 7, 8, 10]);
    expect(out.rotation).toEqual(2);
  });
});

describe("Quantize", () => {
  //Quantize
  it("should quantize a note", () => {
    let intervalVector = new MyIV.IntervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);
    let scale1 = MyScale.scale(intervalVector, 0, 0, 0, false, false, 0);
    let intervalVector2 = new MyIV.IntervalVector([2, 1, 2, 2, 2, 1, 2], 12, 0);
    let scale2 = MyScale.scale(intervalVector2, 0, 0, 0, false, false, 0);
    let out = MyQuantize.transpose(scale1, scale2, 0, 1, [0, 2, 4]);

    expect(out.degrees).toEqual([0, 1, 2]);
    expect(out.notes).toEqual([1, 3, 4]);
  });
});
