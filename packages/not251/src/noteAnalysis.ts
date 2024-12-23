type NoteInfo = {
    position: number;
    degree: number;
    octave: number;
    noteValue: number;
};

type Analysis = {
    chord: NoteInfo;
    scale: NoteInfo;
    chromatic: NoteInfo;
};

function normalizeNotes(notes: number[], mod: number): number[] {
    return notes.map(note => {
        const normalized = note % mod;
        // Handle negative numbers correctly
        return normalized < 0 ? normalized + mod : normalized;
    });
}

function hierarchy(
    note: number,
    chord: number[],
    scale: number[],
    chromatic: number[],
    mod: number
): Analysis {
    // Normalize the chord array before processing
    const normalizedChord = normalizeNotes(chord, mod);

    const info = (inputNote: number, vector: number[], mod: number): NoteInfo => {
        const normalizedNote = inputNote % mod;
        const baseOctave = Math.floor(inputNote / mod);

        let degree = -1;
        for (let i = 0; i < vector.length; i++) {
            if (vector[i] % mod === normalizedNote) {
                degree = i;
                break;
            }
        }

        if (degree === -1) {
            return {
                position: -666,
                degree: -666,
                octave: -666,
                noteValue: -666
            };
        }

        // Calculate absolute position
        const octaveAdjustment = Math.floor(vector[degree] / mod);
        const position = (baseOctave + octaveAdjustment) * vector.length + degree;

        return {
            position: position,
            degree: degree,
            octave: baseOctave + octaveAdjustment,
            noteValue: inputNote
        };
    };

    return {
        chord: info(note, normalizedChord, mod),
        scale: info(note, scale, mod),
        chromatic: info(note, chromatic, mod)
    };
}

function formatOutput(
    notes: number[],
    chord: number[],
    scale: number[],
    chromatic: number[],
    mod: number,
    results: Analysis[]
): string {
    // Show both original and normalized chord in the output
    const normalizedChord = normalizeNotes(chord, mod);
    
    let output = '';
    
    // Header information
    output += `Input Parameters:\n`;
    output += `Notes to analyze: [${notes.join(', ')}]\n`;
    output += `Chord: [${chord.join(', ')}]\n`;
    output += `Scale: [${scale.join(', ')}]\n`;
    output += `Chromatic: [${chromatic.join(', ')}]\n`;
    output += `Modulo: ${mod}\n\n`;
    
    // Helper function for consistent formatting
    const formatAnalysis = (type: string, info: NoteInfo, vectorLength: number) => {
        if (info.position === -666) {
            return `${type} Analysis: Note not found in ${type.toLowerCase()}\n`;
        }
        return `${type} Analysis:\n` +
               `  Position: ${info.position}\n` +
               `  Degree: ${info.degree}\n` +
               `  Octave: ${info.octave}\n`;
    };
    
    // Process each note's analysis
    notes.forEach((note, index) => {
        output += `\nMIDI note ${note} (value ${index}):\n`;
        output += `--------\n`;
        output += formatAnalysis('Chromatic', results[index].chromatic, chromatic.length);
        output += formatAnalysis('Scale', results[index].scale, scale.length);
        output += formatAnalysis('Chord', results[index].chord, chord.length);
    });
    
    return output;
}

type VectorModification = {
    type: 'chord' | 'scale' | 'chromatic';
    delta: number;
};

function tripleSelect(
    analysis: Analysis,
    modifications: VectorModification[],
    chord: number[],
    scale: number[],
    chromatic: number[],
    mod: number
): number[] {
    // Helper function to calculate note from position
    const getNoteFromPosition = (
        position: number,
        vector: number[],
        mod: number
    ): number => {
        const vectorLength = vector.length;
        const octave = Math.floor(position / vectorLength);
        const degree = position % vectorLength;
        return vector[degree] + (octave * mod);
    };

    const results: number[] = [];

    // Process each modification
    for (const modification of modifications) {
        let basePosition;
        let vector;

        // Select the appropriate vector and position based on modification type
        switch (modification.type) {
            case 'chord':
                basePosition = analysis.chord.position;
                vector = chord;
                break;
            case 'scale':
                basePosition = analysis.scale.position;
                vector = scale;
                break;
            case 'chromatic':
                basePosition = analysis.chromatic.position;
                vector = chromatic;
                break;
            default:
                throw new Error('Invalid modification type');
        }

        // Calculate the target position and resulting note
        const targetPosition = basePosition + modification.delta;
        const resultNote = getNoteFromPosition(targetPosition, vector, mod);
        results.push(resultNote);
    }

    return results;
}
function formatModification(mod: VectorModification): string {
    if (mod.delta === 0) {
        return `- No movement in ${mod.type}`;
    }
    const direction = mod.delta > 0 ? 'up' : 'down';
    const amount = Math.abs(mod.delta);
    return `- Moved ${direction} ${amount} position${amount !== 1 ? 's' : ''} in ${mod.type}`;
}

const chord = [-1, 2, 7];  // Major triad
const scale = [0, 2, 4, 5, 7, 9, 11];  // Major scale
const chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Chromatic scale
const mod = 12;


// Test notes (C4 and D4)
const testNotes = [62];

// First, get hierarchical analysis for both notes
const analysisResults = testNotes.map(note => 
    hierarchy(note, chord, scale, chromatic, mod)
);

// Print the formatted analysis
console.log(formatOutput(testNotes, chord, scale, chromatic, mod, analysisResults));

// Define modifications for tripleSelect
const modifications: VectorModification[] = [
    { type: 'chord', delta: 1 },     // Move up 1 in chord
    { type: 'chromatic', delta: -1 }, // Move down 1 in chromatic
    { type: 'scale', delta: -2 }      // Move down 2 in scale
];

console.log('\nTripleSelect Results:');
testNotes.forEach((note, index) => {
    const selectedNotes = tripleSelect(
        analysisResults[index],
        modifications,
        chord,
        scale,
        chromatic,
        mod
    );
    console.log(`\nFor MIDI note ${note}:`);
    console.log('Selected notes:', selectedNotes);
    console.log('Modifications applied:');
    modifications.forEach(mod => {
        console.log(formatModification(mod));
    });

});
