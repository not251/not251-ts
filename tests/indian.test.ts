import * as not251 from "../src";

describe("indian", () => {
  it("indian tests", () => {
    let l = not251.phraseLength(1, 1, 16, 1, 1);
    let result = not251.tihai(l, 3, true);
    expect(result).toEqual([1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]);
  });

  it("indian tests", () => {
    let l = not251.phraseLength(1, 1, 16, 1, 1);
    let result = not251.tihai(l, 5, false);
    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let result2 = not251.tihai(l, 5, true);
    expect(result2).toEqual([1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]);
  });
});
