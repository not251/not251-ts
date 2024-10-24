import * as not251 from "../src";

describe("scaleNames tests", () => {
  it("Do maggiore", () => {
    const doMaggiore = not251.scale();
    const nomi = doMaggiore.names("it").map((note) => note.name);
    expect(nomi).toEqual(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]);
  });

  it("Re maggiore", () => {
    const reMaggiore = not251.scale({ root: 2 });
    const nomi = reMaggiore.names("it").map((note) => note.name);
    expect(nomi).toEqual(["Re", "Mi", "Fa♯", "Sol", "La", "Si", "Do♯"]);
  });
  /*
  it("Mi♭ maggiore", () => {
    const mibMaggiore = not251.scale({ root: 3 });
    const nomi = mibMaggiore.names("it").map((note) => note.name);
    expect(nomi).toEqual(["Mi♭", "Fa", "Sol", "La♭", "Si♭", "Do", "Re"]);
  });
*/
  it("Scala minore naturale di La", () => {
    const laMinoreNaturale = not251.scale({ grado: 5 });
    const nomi = laMinoreNaturale.names("it").map((note) => note.name);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"]);
  });

  it("Scala minore armonica di La", () => {
    const laMinoreArmonica = new not251.positionVector(
      [9, 11, 12, 14, 16, 17, 20],
      12,
      12
    );
    const nomi = laMinoreArmonica.names("it").map((note) => note.name);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol♯"]);
  });

  it("Scala minore melodica di La", () => {
    const laMinoreMelodica = new not251.positionVector(
      [9, 11, 12, 14, 16, 18, 20],
      12,
      12
    );
    const nomi = laMinoreMelodica.names("it").map((note) => note.name);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa♯", "Sol♯"]);
  });

  it("Scala minore melodica di La in notazione inglese", () => {
    const laMinoreMelodica = new not251.positionVector(
      [9, 11, 12, 14, 16, 18, 20],
      12,
      12
    );
    const nomi = laMinoreMelodica.names().map((note) => note.name);
    expect(nomi).toEqual(["A", "B", "C", "D", "E", "F♯", "G♯"]);
  });
});
