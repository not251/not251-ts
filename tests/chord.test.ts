import * as not251 from "../src";

describe("chord", () => {
  it("should create a C Major chord from interval", () => {
    let c_major = not251.chord();
    expect(c_major.data).toEqual([60, 64, 67]);
  });

  it("should create a C Major chord from position", () => {
    let c_major = not251.chord({
      selection: new not251.positionVector([0, 2, 4], 12, 12),
    });
    expect(c_major.data).toEqual([60, 64, 67]);
  });
  it("should create a D Major chord from interval", () => {
    let d_major = not251.chord({ root: 2 });
    expect(d_major.data).toEqual([62, 66, 69]);
  });
});

describe("autoVoicing", () => {
  it("should autovoice the two chords", () => {
    let referenceChordParams = { ...not251.defaultChordParams };
    referenceChordParams.grado = 0;
    referenceChordParams.octave = 0;

    let targetChordParams = { ...not251.defaultChordParams };
    targetChordParams.grado = 4;
    targetChordParams.octave = 0;

    let out = not251.autoVoicing(referenceChordParams, targetChordParams);

    expect(not251.chord(referenceChordParams).data).toEqual([0, 4, 7]);
    expect(not251.chord(targetChordParams).data).toEqual([7, 11, 14]);
    expect(not251.chord(out).data).toEqual([-1, 2, 7]);
    expect(out.position).toEqual(-2);
  });

  it("should autovoice the same chord", () => {
    let referenceChordParams = { ...not251.defaultChordParams };
    referenceChordParams.octave = 0;

    let targetChordParams = { ...not251.defaultChordParams };
    targetChordParams.octave = 0;

    let out = not251.autoVoicing(referenceChordParams, targetChordParams);

    expect(not251.chord(referenceChordParams).data).toEqual([0, 4, 7]);
    expect(not251.chord(targetChordParams).data).toEqual([0, 4, 7]);
    expect(not251.chord(out).data).toEqual([0, 4, 7]);
    expect(out.position).toEqual(0);
  });
});

/*
it("should autovoice P2P two chord", () => {
  let out = not251.autovoicingP2P(
    new not251.positionVector([0, 4, 7], 12, 12),
    new not251.positionVector([5, 9, 12, 16], 12, 24)
  );

  expect(out.data).toEqual([0, 4, 5, 9]);
});
*/
