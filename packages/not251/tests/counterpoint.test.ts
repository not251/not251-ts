import * as not251 from "../src";

describe("counterpoint", () => {
  it("counterpoint tests", () => {
    let outputScale = not251.scale();
    let outRoot = 0;

    let transposedMelody = not251.transpose(
      not251.scale(),
      outputScale,
      outRoot,
      0,
      [60, 64, 67]
    ).notes;

    let counterpoint = not251.generateCounterpoint(
      outputScale,
      outRoot,
      0,
      transposedMelody,
      [1, 1, 1],
      [0, 1, 2],
      true,
      false,
      false,
      0,
      100,
      100,
      16,
      0,
      true
    );

    expect(counterpoint.notes).toEqual([60, 56, 53]);
  });
});
