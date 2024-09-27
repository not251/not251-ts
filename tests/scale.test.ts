import * as MyIV from "../src/IntervalVector";
import * as MyScale from "../src/Scale";

describe("Scale", () => {
  //C MAJOR
  it("should create a C Major scale", () => {
    let intervalVector = new MyIV.IntervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);
    let scale = MyScale.scale(intervalVector, 0, 0, 0, false, false, 0);
    expect(scale.data).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  //D MAJOR
  it("should create a D Major scale", () => {
    let intervalVector = new MyIV.IntervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);
    let scale = MyScale.scale(intervalVector, 1, 2, 0, false, false, 0);
    expect(scale.data).toEqual([1, 2, 4, 6, 8, 9, 11]);
  });

  //C MINOR
  it("should create a C Minor scale", () => {
    let intervalVector = new MyIV.IntervalVector([2, 1, 2, 2, 1, 2, 2], 12, 0);
    let scale = MyScale.scale(intervalVector, 0, 0, 0, false, false, 0);
    expect(scale.data).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });
});