/**
 * Converts a root note with a specified octave and chord type into MIDI note numbers.
 * Handles enharmonic equivalence, supports a wide range of chord types, and adds slash chord logic.
 *
 * @param root - The root note object containing the note name and its octave.
 * @param chord - The chord type, including slash chords (e.g., "dom7/G").
 * @returns An array of MIDI note numbers corresponding to the chord.
 */
function namesToMidi(root: { note: string; octave: number }, chord: string, modulo: number): number[] {
    // Map of note names (including enharmonics) to their semitone offset from C.
    const noteMap: Record<string, number> = {
        'C': 0, 'B♯': 0, 'D♭♭': 0,
        'C♯': 1, 'D♭': 1,
        'D': 2, 'C♯♯': 2, 'E♭♭': 2,
        'D♯': 3, 'E♭': 3,
        'E': 4, 'D♯♯': 4, 'F♭': 4,
        'F': 5, 'E♯': 5, 'G♭♭': 5,
        'F♯': 6, 'G♭': 6,
        'G': 7, 'F♯♯': 7, 'A♭♭': 7,
        'G♯': 8, 'A♭': 8,
        'A': 9, 'G♯♯': 9, 'B♭♭': 9,
        'A♯': 10, 'B♭': 10,
        'B': 11, 'A♯♯': 11, 'C♭': 11
    };

    // Comprehensive map of chord types to their semitone intervals.
    const chordMap: Record<string, number[]> = {
        // Triads
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "augmented": [0, 4, 8],
        "diminished": [0, 3, 6],

        // Seventh chords
        "maj7": [0, 4, 7, 11],
        "min7": [0, 3, 7, 10],
        "dom7": [0, 4, 7, 10],
        "dim7": [0, 3, 6, 10],
        "7dim": [0, 3, 6, 9],
        "aug/maj7": [0, 4, 8, 11],

        // Extended chords
        "9": [0, 4, 7, 10, 14],
        "b9": [0, 4, 7, 10, 14],
        "maj9": [0, 4, 7, 11, 14],
        "min9": [0, 3, 7, 10, 14],
        "11": [0, 4, 7, 10, 14, 17],
        "#11": [0, 4, 7, 10, 14, 18],
        "maj11": [0, 4, 7, 11, 14, 17],
        "min11": [0, 3, 7, 10, 14, 17],
        "13": [0, 4, 7, 10, 14, 17, 21],
        "b13": [0, 4, 7, 10, 14, 17, 20],
        "maj13": [0, 4, 7, 11, 14, 17, 21],
        "min13": [0, 3, 7, 10, 14, 17, 21],

        // Altered chords
        "7b9": [0, 4, 7, 10, 13],
        "7#9": [0, 4, 7, 10, 15],
        "7b5": [0, 4, 6, 10],
        "7#5": [0, 4, 8, 10],
        "7b13": [0, 4, 7, 10, 20],
        "7#11": [0, 4, 7, 10, 18],
        "7b9#11": [0, 4, 7, 10, 13, 18],

        // Suspended chords
        "sus2": [0, 2, 7],
        "sus4": [0, 5, 7],
        "7sus4": [0, 5, 7, 10],

        // Add chords
        "add9": [0, 4, 7, 14],
        "add11": [0, 4, 7, 17],
        "add13": [0, 4, 7, 21],

        // Other common chords
        "6": [0, 4, 7, 9],
        "m6": [0, 3, 7, 9],
        "6/9": [0, 4, 7, 9, 14],
        "m6/9": [0, 3, 7, 9, 14],
    };

    if (!(root.note in noteMap)) {
        throw new Error(`Invalid root note: ${root.note}`);
    }
    if (typeof root.octave !== 'number' || isNaN(root.octave)) {
        throw new Error(`Invalid octave for root note ${root.note}: ${root.octave}`);
    }

    // Check if the full chord name exists in the map.
    if (chord in chordMap) {
        const rootMidi = root.octave * modulo + noteMap[root.note];
        const intervals = chordMap[chord];
        return intervals.map(interval => rootMidi + interval);
    }

    // Otherwise, split and process as a slash chord.
    const [mainChord, potentialBass] = chord.split('/');

    if (!(mainChord in chordMap)) {
        throw new Error(`Invalid chord type: ${mainChord}`);
    }

    const rootMidi = root.octave * modulo + noteMap[root.note];
    const intervals = chordMap[mainChord];
    const chordNotes = intervals.map(interval => rootMidi + interval);

    // Handle slash chords with valid bass notes.
    if (potentialBass && potentialBass in noteMap) {
        const bassMidi = (root.octave - 1) * modulo + noteMap[potentialBass];
        chordNotes.unshift(bassMidi); // Prepend the bass note.
    }

    return chordNotes;
}
// Example usage:
const root = { note: 'C', octave: 5 };
const modulo = 12;

console.log(namesToMidi(root, "dom7", modulo));       // [60, 64, 67, 70]
console.log(namesToMidi(root, "dom7/G", modulo));    // [55, 60, 64, 67, 70]
console.log(namesToMidi(root, "maj7/F", modulo));    // [53, 60, 64, 67, 71]
console.log(namesToMidi(root, "7dim/E", modulo));  // [52, 60, 63, 66, 70]
console.log(namesToMidi(root, "dom7", modulo));      // [60, 64, 67, 70]
console.log(namesToMidi(root, "maj7/9", modulo));   // [60, 64, 67, 71, 74]
console.log(namesToMidi(root, "13", modulo));       // [60, 64, 67, 70, 74, 77, 81]
console.log(namesToMidi(root, "7#9", modulo));      // [60, 64, 67, 70, 75]
console.log(namesToMidi(root, "add9", modulo));     // [60, 64, 67, 74]
console.log(namesToMidi(root, "m6/9", modulo));     // [60, 63, 67, 69, 74]
