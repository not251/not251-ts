import * as not251 from "../src";

describe("mirror", () => {
  it("mirror functions tests", () => {
    let input: number[] = [1, 2, 3, 4, 5, 6, 7];

    const result1 = not251.mirror.doubleMirror(input, 1);
    const result2 = not251.mirror.singleMirror(input, 1, true);
    const result3 = not251.mirror.singleMirror(input, 1, false);
    const result4 = not251.mirror.mirror2(input, 1, false);
    const result5 = not251.mirror.mirror2(input, 1, true);

    expect(result1).toEqual([1, 7, 6, 5, 4, 3, 2]); //double mirror
    expect(result2).toEqual([1, 2, 3, 4, 5, 6, 7]); //single mirror left
    expect(result3).toEqual([1, 7, 6, 5, 4, 3, 2]); //single mirror right
    expect(result4).toEqual([7, 6, 5, 4, 3, 2, 7]); //mirror2 right
    expect(result5).toEqual([1, 2, 3, 4, 5, 6, 1]); //mirror2 left
  });
});
