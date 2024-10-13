import * as not251 from "../src";

describe("grid", () => {
  it("priority grid test", () => {
    let group = new not251.intervalVector([4], 6, 0);
    let n = 4;
    let left = true;

    let out = not251.grid(n, group, left);

    expect(out).toEqual([
      [1, 0, 0, 0],
      [1, 0, 2, 0],
      [1, 3, 2, 3],
    ]);
  });
});
