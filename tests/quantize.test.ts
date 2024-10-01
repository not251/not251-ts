import * as not251 from "../src";

describe("quantize tests", () => {
  it("quantize test", () => {
    var transposed = not251.transpose(
      not251.scale(
        new not251.intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
        0,
        0,
        0,
        false,
        false,
        0
      ),
      not251.scale(
        new not251.intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
        0,
        0,
        0,
        false,
        false,
        0
      ),
      0,
      0,
      [60, 65, 66]
    );
    expect(transposed.notes).toEqual([60, 65, 67]); //notes
    expect(transposed.degrees).toEqual([0, 3, 4]); //notes
  });

  it("transpose test", () => {
    var transposed = not251.transpose(
      not251.scale(
        new not251.intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
        0,
        0,
        0,
        false,
        false,
        0
      ),
      not251.scale(
        new not251.intervalVector([2, 1, 2, 2, 2, 1, 2], 12, 0),
        1,
        0,
        0,
        false,
        false,
        0
      ),
      0,
      0,
      [60, 65, 66]
    );
    expect(transposed.notes).toEqual([61, 66, 68]); //notes
    expect(transposed.degrees).toEqual([0, 3, 4]); //notes
  });
});
