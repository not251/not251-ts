/**
 * Generates a vector of numbers representing a chord based on the root, octave, and voicing parameters.
 *
 * @param root - The root note as an integer.
 * @param octave - The octave as an integer, added to all values.
 * @param voicing - An object containing the parameters for chord voicing.
 * @returns A sorted array of unique integers representing the chord.
 */
function chordFromParams(
  root: number,
  octave: number,
  voicing: {
    root?: "yes";
    third?: "major" | "minor" | "omit";
    fifth?: "perfect" | "augmented" | "diminished" | "omit";
    seventh?: "major" | "minor" | "diminished";
    ninth?: "major" | "minor";
    eleventh?: "natural" | "sharp";
    thirteenth?: "natural" | "flat";
    second?: "major" | "minor";
    fourth?: "perfect" | "sharp";
    sixth?: "major" | "minor";
    sus2?: "sus 2" | "sus b2";
    sus4?: "sus 4" | "sus #4";
  }
): number[] {
  const chord: Set<number> = new Set();

  // Triad
  // Root
  if (voicing.root) {
    chord.add(root);
  }
  // Third and suspensions
  if (voicing.sus2) {
    switch (voicing.sus2) {
      case "sus 2":
        chord.add(root + 2);
        break;
      case "sus b2":
        chord.add(root + 1);
        break;
    }
  } 
    if (voicing.sus4) {
    switch (voicing.sus4) {

      case "sus 4":
        chord.add(root + 5);
        break;
      case "sus #4":
        chord.add(root + 6);
        break;
    }
  } 
  else if (voicing.third) {
    switch (voicing.third) {
      case "major":
        chord.add(root + 4);
        break;
      case "minor":
        chord.add(root + 3);
        break;
    }
  }

  // Fifth
  if (voicing.fifth) {
    switch (voicing.fifth) {
      case "perfect":
        chord.add(root + 7);
        break;
      case "augmented":
        chord.add(root + 8);
        break;
      case "diminished":
        chord.add(root + 6);
        break;
    }
  }

  // Extensions
  // Seventh
  if (voicing.seventh) {
    switch (voicing.seventh) {
      case "major":
        chord.add(root + 11);
        break;
      case "minor":
        chord.add(root + 10);
        break;
      case "diminished":
        chord.add(root + 9);
        break;
    }
  }

  // Ninth
  if (voicing.ninth) {
    switch (voicing.ninth) {
      case "major":
        chord.add(root + 14);
        break;
      case "minor":
        chord.add(root + 13);
        break;
    }
  }

  // Eleventh
  if (voicing.eleventh) {
    switch (voicing.eleventh) {
      case "natural":
        chord.add(root + 17);
        break;
      case "sharp":
        chord.add(root + 18);
        break;
    }
  }

  // Thirteenth
  if (voicing.thirteenth) {
    switch (voicing.thirteenth) {
      case "natural":
        chord.add(root + 21);
        break;
      case "flat":
        chord.add(root + 20);
        break;
    }
  }

  // Added notes
  // Second
  if (voicing.second) {
    switch (voicing.second) {
      case "major":
        chord.add(root + 2);
        break;
      case "minor":
        chord.add(root + 1);
        break;
    }
  }
  // Fourth
  if (voicing.fourth) {
    switch (voicing.fourth) {
      case "perfect":
        chord.add(root + 5);
        break;
      case "sharp":
        chord.add(root + 6);
        break;
    }
  }
  // Sixth
  if (voicing.sixth) {
    switch (voicing.sixth) {
      case "major":
        chord.add(root + 9);
        break;
      case "minor":
        chord.add(root + 8);
        break;
    }
  }  

  // Adjust for octave and sort the chord
  return Array.from(chord, note => note + octave * 12).sort((a, b) => a - b);
}


const chord = chordFromParams(0, 5, {
  root: "yes",
  third: "major",
  fifth: "perfect",
  sixth: "major",
  second: "major",
  fourth: "sharp",
  seventh: "minor",
});

console.log(chord);
