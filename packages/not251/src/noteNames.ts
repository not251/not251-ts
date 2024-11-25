/**
 * Represents the direction of musical note alteration
 * - "natural": No alteration (e.g., C)
 * - "right": Sharp alteration (e.g., C♯)
 * - "left": Flat alteration (e.g., D♭)
 * - null: No specific alteration
 */
type alterationDirection = 'natural' | 'right' | 'left' | null;
/**
 * Represents a musical note with its classification
 */
interface ClassifiedNote {
    /** The musical note string representation */
    note: string;
    /** The direction of alteration for this note */
    label: alterationDirection;
}
/**
 * Array of enharmonically equivalent notes.
 * Each sub-array contains notes that sound the same but are written differently.
 * For example: ["C", "B♯", "D♭♭"] all represent the same pitch.
 */
const noteArrays: string[][] = [
    ['C', 'B♯', 'D♭♭'],
    ['C♯', 'D♭'],
    ['D', 'C♯♯', 'E♭♭'],
    ['D♯', 'E♭'],
    ['E', 'D♯♯', 'F♭'],
    ['F', 'E♯', 'G♭♭'],
    ['F♯', 'G♭'],
    ['G', 'F♯♯', 'A♭♭'],
    ['G♯', 'A♭'],
    ['A', 'G♯♯', 'B♭♭'],
    ['A♯', 'B♭'],
    ['B', 'A♯♯', 'C♭'],
];
/**
 * Classifies notes in the noteArrays based on their alteration direction
 * @param noteArrays - Array of arrays containing enharmonically equivalent notes
 * @returns Array of arrays containing classified notes with their labels
 */
function classifyNotes(noteArrays: string[][]): ClassifiedNote[][] {
    return noteArrays.map(array => {
        // Assign labels based on array length
        const labels: alterationDirection[] =
            array.length === 3 ? ['natural', 'right', 'left'] :
            array.length === 2 ? ['right', 'left'] : [];

        // Map notes to classified objects
        return array.map((note, index) => ({
            note,
            label: labels[index] || null, // Assign label or null if out of bounds
        }));
    });
}
/**
 * Represents the preference for sharp or flat notation
 */
type NotePreference = 'right' | 'left';
/**
 * Options for note mapping configuration
 */
interface NoteMapperOptions {
  preferSharps: boolean;
}
/**
 * Extracts the basic note name without accidentals
 * @param noteName - The full note name including accidentals
 * @returns The basic note letter (A-G)
 */
function getBasicNoteName(noteName: string): string {
  return noteName.charAt(0);
}


/**
 * Checks if an array of note names forms consecutive letters (A through G)
 * @param noteNames Array of note names to check
 * @returns boolean indicating if notes are consecutive
 */
function areNotesConsecutive(noteNames: string[]): boolean {
  const basicNotes = noteNames.map(getBasicNoteName);
  const noteOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  // Check if we can find a valid starting position where all notes are consecutive
  for (let start = 0; start < noteOrder.length; start++) {
    let isValid = true;
    for (let i = 0; i < basicNotes.length; i++) {
      const expected = (start + i) % noteOrder.length;
      if (basicNotes[i] !== noteOrder[expected]) {
        isValid = false;
        break;
      }
    }
    if (isValid) return true;
  }
  return false;
}

/**
 * Finds alternative enharmonic note with desired basic note name
 * @param currentNote Current note name
 * @param desiredBasicNote Desired basic note (A-G)
 * @param noteArrays Reference array of enharmonic equivalents
 * @returns Alternative note name or null if not found
 */
function findAlternativeWithBasicNote(
  currentNote: string,
  desiredBasicNote: string,
  noteArrays: string[][]
): string | null {
  // Find the current note's position in noteArrays
  const groupIndex = noteArrays.findIndex(group => 
    group.some(note => note === currentNote)
  );
  
  if (groupIndex === -1) return null;
  
  // Find an alternative in the same group that starts with the desired basic note
  const alternative = noteArrays[groupIndex].find(note => 
    getBasicNoteName(note) === desiredBasicNote
  );
  
  return alternative || null;
}

/**
 * Gets the next consecutive note letter
 * @param currentNote Basic note letter (A-G)
 * @returns Next note in sequence
 */
function getNextNoteLetter(currentNote: string): string {
  const noteOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const currentIndex = noteOrder.indexOf(currentNote);
  return noteOrder[(currentIndex + 1) % 7];
}


/**
 * Converts MIDI note numbers to musical note names while avoiding duplicate note letters
 * @param midiNumbers - Array of MIDI note numbers to convert
 * @param options - Configuration options for note mapping
 * @param isDiatonicScale - Boolean for enforcing consecutive note names if midiNumbers is a diatonic scale
 * @param noteArrays - Reference array of enharmonic equivalents
 * @param classifiedNotes - Pre-classified notes with their alteration directions
 * @returns Array of note names optimized to avoid duplicate note letters
 * 

 */

function midiNumbersToNoteNames(
  midiNumbers: number[],
  options: NoteMapperOptions & { isDiatonicScale?: boolean },
  noteArrays: string[][],
  classifiedNotes: ClassifiedNote[][]
): string[] {
  // Determine if the scale logic should initially apply
  let isDiatonicScale = midiNumbers.length === 7 && (options.isDiatonicScale ?? true);

  // First pass: Get all notes according to basic preference
  const initialNames = midiNumbers.map((midiNumber) => {
    const noteIndex = midiNumber % 12;
    const possibleNotes = classifiedNotes[noteIndex];

    // Always prefer natural notes
    const naturalNote = possibleNotes.find((note) => note.label === 'natural');
    if (naturalNote) {
      return naturalNote.note;
    }

    // Use preferred accidental if no natural note
    if (options.preferSharps) {
      return possibleNotes.find((note) => note.label === 'right')!.note;
    } else {
      return possibleNotes.find((note) => note.label === 'left')!.note;
    }
  });

  // If not diatonic scale, return the notes directly (No Scale logic)
  if (!isDiatonicScale) {
    return initialNames;
  }

  // For diatonic scales, ensure consecutive note names
  let result = [...initialNames];
  let modified = true;
  let attempts = 0;

  while (!areNotesConsecutive(result) && attempts < 2) {
    modified = false;
    attempts++;

    for (let i = 0; i < result.length - 1; i++) {
      const currentBasicNote = getBasicNoteName(result[i]);
      const nextBasicNote = getBasicNoteName(result[i + 1]);
      const expectedNextNote = getNextNoteLetter(currentBasicNote);

      if (nextBasicNote !== expectedNextNote) {
        const alternative = findAlternativeWithBasicNote(
          result[i + 1],
          expectedNextNote,
          noteArrays
        );

        if (alternative) {
          result[i + 1] = alternative;
          modified = true;
        }
      }
    }

    if (!modified && !areNotesConsecutive(result)) {
      const secondBasicNote = getBasicNoteName(result[1]);
      const expectedFirstNote = String.fromCharCode(
        ((secondBasicNote.charCodeAt(0) - 'A'.charCodeAt(0) + 6) % 7) + 'A'.charCodeAt(0)
      );

      const alternative = findAlternativeWithBasicNote(
        result[0],
        expectedFirstNote,
        noteArrays
      );

      if (alternative) {
        result[0] = alternative;
        modified = true;
      }
    }
  }

  // Check if notes are consecutive after scale logic
  if (!areNotesConsecutive(result)) {
    // Fallback to "no scale" logic if consecutive notes are not achieved
    isDiatonicScale = false;
    return initialNames;
  }

  return result;
}


function testMidiNumbersToNoteNames(
  testCases: number[][],
  noteArrays: string[][],
  classifiedNotes: ClassifiedNote[][]
): void {
  const options = [
    { preferSharps: true, isDiatonicScale: true, label: 'Sharps (Diatonic scale)' },
    { preferSharps: false, isDiatonicScale: true, label: 'Flats (Diatonic scale)' },
    { preferSharps: true, isDiatonicScale: false, label: 'Sharps (Non diatonic scale)' },
    { preferSharps: false, isDiatonicScale: false, label: 'Flats (Non diatonic scale)' },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\nTest Case #${index + 1}: Notes [${testCase.join(", ")}]`);

    options.forEach(({ preferSharps, isDiatonicScale, label }) => {
      // Skip (Scale) results if input length isn't 7
      if (isDiatonicScale && testCase.length !== 7) return;

      const result = midiNumbersToNoteNames(
        testCase,
        { preferSharps, isDiatonicScale },
        noteArrays,
        classifiedNotes
      );
      console.log(`${label}: ${result.join(" ")}`);
    });
  });
}

// Example usage:
const testCases = [
  [1, 3, 5, 6, 8, 9, 12], // C# or Db harmonic major
  [0, 2, 3, 5, 7, 9, 10], // C Dorian
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Chromatic scale
  [1, 3, 5, 7, 9, 11], // Whole tone scale
  [0, 4, 7, 8], // C maj/min6
  [0, 4,8], // C augmented triad
  [0, 4, 7, 8, 9], // C major to A
  [0, 4, 6, 7, 8, 9, 11], // Example with 7 notes
];

const classifiedNotes = classifyNotes(noteArrays);
testMidiNumbersToNoteNames(testCases, noteArrays, classifiedNotes);
