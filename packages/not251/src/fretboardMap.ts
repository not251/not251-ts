interface FretNote {
  /** MIDI note number */
  midiNumber: number;
  /** Fret position */
  fret: number;
  /** String number (starting from 1 for the lowest/thickest string) */
  string: number;
}

/**
 * Find chord voicings with proximity to previous voicing
 * @param chordNoteSequence - Array of chord MIDI note arrays to find voicings for
 * @param maxHandStretch - Maximum fret distance between lowest and highest frets in a voicing
 * @param tuning - Array of MIDI numbers representing open string tunings (default is standard tuning)
 * @param numberOfFrets - Total number of frets to map (default is 12)
 * @returns Array of voicings, one for each chord in the sequence
 */
function findProximityChordVoicings(
  chordNoteSequence: number[][],
  maxHandStretch: number = 4,
  tuning: number[] = [40, 45, 50, 55, 59, 64], // Standard tuning (E2, A2, D3, G3, B3, E4)
  numberOfFrets: number = 12
): FretNote[][] {
  // Function to calculate the total fret movement between two voicings
  const calculateVoicingDistance = (
    prevVoicing: FretNote[], 
    currentVoicing: FretNote[]
  ): number => {
    if (prevVoicing.length === 0) return 0;

    // Calculate average fret movement
    const fretMovements = prevVoicing.map(prevNote => {
      // Find the corresponding note in the current voicing (if exists)
      const matchingNote = currentVoicing.find(
        currNote => currNote.midiNumber === prevNote.midiNumber
      );
      
      return matchingNote 
        ? Math.abs(matchingNote.fret - prevNote.fret)
        : maxHandStretch; // Penalize notes that aren't in the new voicing
    });

    return fretMovements.reduce((sum, movement) => sum + movement, 0) / prevVoicing.length;
  };

  // Find all possible locations for each note in each chord
  const notePossibilities: FretNote[][][] = chordNoteSequence.map(chordNotes => 
    chordNotes.map(note => 
      findMidiNumberLocations(note, tuning, numberOfFrets)
    )
  );

  // Recursive function to find voicings with minimal movement
  const findOptimalVoicings = (
    chordIndex: number, 
    previousVoicing: FretNote[] = []
  ): FretNote[][] => {
    // Base case: if we've processed all chords
    if (chordIndex >= chordNoteSequence.length) {
      return [];
    }

    // Get possible note locations for the current chord
    const currentChordNoteOptions = notePossibilities[chordIndex];

    // Find all possible voicings for the current chord
    const potentialVoicings = findChordVoicingsForNotes(
      currentChordNoteOptions, 
      maxHandStretch
    );

    // If this is the first chord, select the first voicing
    if (chordIndex === 0) {
      const initialVoicing = potentialVoicings[0];
      const subsequentVoicings = findOptimalVoicings(chordIndex + 1, initialVoicing);
      return [initialVoicing, ...subsequentVoicings];
    }

    // Find the voicing with the least movement from the previous voicing
    if (potentialVoicings.length > 0) {
      const closestVoicing = potentialVoicings.reduce((closest, current) => {
        const currentDistance = calculateVoicingDistance(previousVoicing, current);
        const closestDistance = calculateVoicingDistance(previousVoicing, closest);
        return currentDistance < closestDistance ? current : closest;
      });

      // Recursively find voicings for subsequent chords
      const subsequentVoicings = findOptimalVoicings(chordIndex + 1, closestVoicing);
      return [closestVoicing, ...subsequentVoicings];
    }

    // If no voicings found, return an empty array
    return [];
  };

  // Helper function to find valid chord voicings for a set of note possibilities
  function findChordVoicingsForNotes(
    currentNotePossibilities: FretNote[][],
    maxStretch: number
  ): FretNote[][] {
    const findVoicingsInner = (
      currentVoicing: FretNote[] = [], 
      remainingNotes: FretNote[][]
    ): FretNote[][] => {
      // Base case: if we've placed all notes
      if (remainingNotes.length === 0) {
        return [currentVoicing];
      }

      const currentNoteOptions = remainingNotes[0];
      const remainingNoteOptions = remainingNotes.slice(1);

      const validVoicings: FretNote[][] = [];

      for (const noteLocation of currentNoteOptions) {
        // Check if this location conflicts with existing voicing
        const isValidLocation = currentVoicing.every(
          placedNote => placedNote.string !== noteLocation.string
        );

        if (isValidLocation) {
          const newVoicing = [...currentVoicing, noteLocation];
          
          // Check hand stretch constraint
          const voicingFrets = newVoicing.map(note => note.fret);
          const minFret = Math.min(...voicingFrets);
          const maxFret = Math.max(...voicingFrets);
          const fretSpan = maxFret - minFret;

          // Only proceed if fret span is within hand stretch
          if (fretSpan <= maxStretch || currentVoicing.length === 0) {
            const subVoicings = findVoicingsInner(newVoicing, remainingNoteOptions);
            validVoicings.push(...subVoicings);
          }
        }
      }

      return validVoicings;
    };

    return findVoicingsInner([], currentNotePossibilities);
  }

  // Find all possible voicings
  return findOptimalVoicings(0);
}

// Helper function to find all MIDI number locations on the fretboard
function findMidiNumberLocations(
  midiNumber: number,
  tuning: number[] = [40, 45, 50, 55, 59, 64], // Standard tuning
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
          string: tuning.length - stringIndex // Reverse the string numbering
        });
      }
    }
  });

  return locations;
}
// Helper function to log voicings
function logVoicings(voicings: FretNote[][]) {
  voicings.forEach((voicing, index) => {
    console.log(`Voicing ${index + 1}:`);
    voicing.forEach(note => {
      console.log(`  Note ${note.midiNumber} on string ${note.string} at fret ${note.fret}`);
    });

    const frets = voicing.map(note => note.fret);
    console.log(`  Hand stretch: ${Math.max(...frets) - Math.min(...frets)}`);
  });
}

// Example usage
const chordSequence = [
  [60, 64, 67, 71],   // C Major
  [65, 69, 72],   // F Major
  [62, 65, 69],   // D Minor
];

const handSize = 4;
const proximityVoicings = findProximityChordVoicings(chordSequence, handSize);
logVoicings(proximityVoicings);
