import * as not251 from "../src";

describe("scale", () => {
  //C MAJOR
  it("should create a C Major scale", () => {
    let scale = not251.scale();

    expect(scale.data).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  //D MAJOR
  it("should create a D Major scale", () => {
    let d_major = not251.scale({ root: 2 });

    expect(d_major.data).toEqual([2, 4, 6, 7, 9, 11, 13]);
  });

  //C MINOR
  it("should create a C Minor scale", () => {
    let c_minor = not251.scale({
      root: 0,
      intervals: new not251.intervalVector([2, 1, 2, 2, 1, 2, 2], 12, 0),
    });

    expect(c_minor.data).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });
});

describe("autoMode", () => {
  it("should rotate scale to mode 1", () => {
    let out = not251.autoMode(
      not251.defaultScaleParams,
      new not251.positionVector([61], 12, 12)
    );
    expect(not251.scale(out).data).toEqual([0, 1, 3, 5, 7, 8, 10]);
    expect(out.modo).toEqual(2);
  });
});
