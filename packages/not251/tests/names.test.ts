import * as not251 from "../src";

describe("scaleNames tests", () => {
  it("Do maggiore", () => {
    const doMaggiore = not251.scale();
    const nomi = not251.names(doMaggiore, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]);
  });

  it("Re maggiore", () => {
    const reMaggiore = not251.scale({ root: 2 });
    const nomi = not251.names(reMaggiore, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#"]);
  });
  /*
  it("Mi♭ maggiore", () => {
    const mibMaggiore = not251.scale({ root: 3 });
    const nomi = not251.names(mibMaggiore, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["Mi♭", "Fa", "Sol", "La♭", "Si♭", "Do", "Re"]);
  });
*/
  it("Scala minore naturale di La", () => {
    const laMinoreNaturale = not251.scale({ grado: 5 });
    const nomi = not251.names(laMinoreNaturale, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"]);
  });

  it("Scala minore armonica di La", () => {
    const laMinoreArmonica = new not251.positionVector(
      [9, 11, 12, 14, 16, 17, 20],
      12,
      12
    );
    const nomi = not251.names(laMinoreArmonica, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol#"]);
  });

  it("Scala minore melodica di La", () => {
    const laMinoreMelodica = new not251.positionVector(
      [9, 11, 12, 14, 16, 18, 20],
      12,
      12
    );
    const nomi = not251.names(laMinoreMelodica, ["it"]).map((note) => note.it);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa#", "Sol#"]);
  });

  it("Scala minore melodica di La in notazione inglese", () => {
    const laMinoreMelodica = new not251.positionVector(
      [9, 11, 12, 14, 16, 18, 20],
      12,
      12
    );
    const nomi = not251.names(laMinoreMelodica).map((note) => note.en);
    expect(nomi).toEqual(["A", "B", "C", "D", "E", "F#", "G#"]);
  });
});
