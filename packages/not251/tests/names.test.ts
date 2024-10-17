import * as not251 from "../src";
import { scaleNames } from "../src/names";


describe("scaleNames tests", () => {
  it("Do maggiore", () => {
    const doMaggiore = not251.scale(); 
    const nomi = scaleNames(doMaggiore);
    expect(nomi).toEqual(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]);
  });

  it("Re maggiore", () => {
    const reMaggiore = not251.scale({ root: 2 }); 
    const nomi = scaleNames(reMaggiore);
    expect(nomi).toEqual(["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#"]);
  });

  it("Mib maggiore", () => {
    const mibMaggiore = not251.scale({ root: 3 }); 
    const nomi = scaleNames(mibMaggiore);
    expect(nomi).toEqual(["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re"]);
  });

  it("Scala minore naturale di La", () => {
    const laMinoreNaturale = not251.scale({ grado: 5});
    const nomi = scaleNames(laMinoreNaturale);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol"]);
  });

  it("Scala minore armonica di La", () => {
    const laMinoreArmonica = new not251.positionVector([9, 11, 12, 14, 16, 17, 20], 12, 12);
    const nomi = scaleNames(laMinoreArmonica);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa", "Sol#"]);
  });

  it("Scala minore melodica di La", () => {
    const laMinoreMelodica = new not251.positionVector([9, 11, 12, 14, 16, 18, 20], 12, 12);
    const nomi = scaleNames(laMinoreMelodica);
    expect(nomi).toEqual(["La", "Si", "Do", "Re", "Mi", "Fa#", "Sol#"]);
  });


it("Scala minore melodica di La in notazione inglese", () => {
  const laMinoreMelodica = new not251.positionVector([9, 11, 12, 14, 16, 18, 20], 12, 12);
  const nomi = scaleNames(laMinoreMelodica, false);
  expect(nomi).toEqual(["A", "B", "C", "D", "E", "F#", "G#"]);
});
})