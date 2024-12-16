interface FretNote {
  /** MIDI note number */
  midiNumber: number;
  /** Fret position */
  fret: number;
  /** String number (starting from 1 for the lowest/thickest string) */
  string: number;
}

/**
 * Find all possible chord voicings on the guitar fretboard
 * @param chordNotes - Array of MIDI numbers representing the chord
 * @param maxHandStretch - Maximum fret distance between lowest and highest frets in a voicing
 * @param standardTuning - Array of MIDI numbers representing open string tunings (default is standard tuning)
 * @param numberOfFrets - Total number of frets to map (default is 12)
 * @returns Array of all possible chord voicings
 */
function findChordVoicings(
  chordNotes: number[],
  maxHandStretch: number = 4, // Default maximum hand stretch of 4 frets
  tuning: number[] = [40, 45, 50, 55, 59, 64], // Standard tuning (E2, A2, D3, G3, B3, E4)
  numberOfFrets: number = 12
): FretNote[][] {
  // Find all possible locations for each note
  const notePossibilities: FretNote[][] = chordNotes.map(note => 
    findMidiNumberLocations(note, tuning, numberOfFrets)
  );

  // Function to find valid chord voicings
  const findVoicings = (
    currentVoicing: FretNote[] = [], 
    remainingNotes: FretNote[][]
  ): FretNote[][] => {
    // Base case: if we've placed all notes
    if (remainingNotes.length === 0) {
      return [currentVoicing];
    }

    // Current set of notes to place
    const currentNotePossibilities = remainingNotes[0];
    const remainingNotesPossibilities = remainingNotes.slice(1);

    // Collect all valid voicings
    const validVoicings: FretNote[][] = [];

    // Try each possible location for the current note
    for (const noteLocation of currentNotePossibilities) {
      // Check if this location conflicts with existing voicing
      const isValidLocation = currentVoicing.every(
        placedNote => placedNote.string !== noteLocation.string
      );

      // If location is valid, do additional checks
      if (isValidLocation) {
        const newVoicing = [...currentVoicing, noteLocation];
        
        // Check hand stretch constraint
        const voicingFrets = newVoicing.map(note => note.fret);
        const minFret = Math.min(...voicingFrets);
        const maxFret = Math.max(...voicingFrets);
        const fretSpan = maxFret - minFret;

        // Only proceed if fret span is within hand stretch
        if (fretSpan <= maxHandStretch || currentVoicing.length === 0) {
          const subVoicings = findVoicings(newVoicing, remainingNotesPossibilities);
          validVoicings.push(...subVoicings);
        }
      }
    }

    return validVoicings;
  };

  // Find all possible voicings
  return findVoicings([], notePossibilities);
}

// Helper function to find all MIDI number locations on the fretboard
function findMidiNumberLocations(
  midiNumber: number,
  tuning: number[] = [40, 45, 50, 55, 59, 64],
  numberOfFrets: number = 12
): FretNote[] {
  const locations: FretNote[] = [];

  tuning.forEach((openStringNote, stringIndex) => {
    for (let fret = 0; fret <= numberOfFrets; fret++) {
      const currentNote = openStringNote + fret;
      
      if (currentNote === midiNumber) {
        locations.push({
          midiNumber,
          fret,
          string: stringIndex + 1
        });
      }
    }
  });

  return locations;
}


const chordMidiNumbers = [60, 64, 67];



const handSize = 4;
const voicings = findChordVoicings(chordMidiNumbers, handSize);
console.log(`Total voicings: ${voicings.length}`);

function logVoicings(voicings: FretNote[][]) {
  voicings.slice(0, chordMidiNumbers.length).forEach((voicing, index) => {
    console.log(`Voicing ${index + 1}:`);
    voicing.forEach(note => {
      console.log(`  Note ${note.midiNumber} on string ${note.string} at fret ${note.fret}`);
    });

    const frets = voicing.map(note => note.fret);
    console.log(`  Hand stretch: ${Math.max(...frets) - Math.min(...frets)}`);
  });
}

logVoicings(voicings);
