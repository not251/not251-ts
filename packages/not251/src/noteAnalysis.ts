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
): { results: number[]; isOut: boolean[] } {
    // Helper function to calculate note from position
    const getNoteFromPosition = (
        position: number,
        vector: number[],
        mod: number
    ): number => {
        const vectorLength = vector.length;
        const octave = Math.floor(position / vectorLength);
        const degree = position % vectorLength;
        return vector[degree] + octave * mod;
    };

    const results: number[] = [];
    const isOut: boolean[] = [];

    // Process each modification
    for (const modification of modifications) {
        let basePosition: number;
        let vector: number[];

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

        // Log and skip the modification if the base position is invalid
        if (basePosition === -666) {
            results.push(NaN); // Placeholder value
            isOut.push(true);
            continue;
        }

        // Calculate the target position and resulting note
        const targetPosition = basePosition + modification.delta;
        const resultNote = getNoteFromPosition(targetPosition, vector, mod);
        results.push(resultNote);
        isOut.push(false);
    }

    return { results, isOut };
}


function formatModification(
    mod: VectorModification,
    isOut: boolean
): string {
    if (isOut) {
        return `Note not found in ${mod.type}`;
    }
    if (mod.delta === 0) {
        return `No movement in ${mod.type}`;
    }
    const direction = mod.delta > 0 ? 'up' : 'down';
    const amount = Math.abs(mod.delta);
    return `Moved ${direction} ${amount} position${amount !== 1 ? 's' : ''} in ${mod.type}`;
}

function parseModifications(
    deltas: number[],
    types: ('chord' | 'scale' | 'chromatic')[]
): VectorModification[] {
    // If only one type is provided, repeat it for all deltas
    if (types.length === 1) {
        types = Array(deltas.length).fill(types[0]);
    }

    // Ensure the input vectors are of the same length
    if (deltas.length !== types.length) {
        throw new Error('Deltas and types must have the same length.');
    }

    // Map the inputs to VectorModification objects
    return deltas.map((delta, index) => ({
        type: types[index],
        delta: delta,
    }));
}

// Example usage
const deltas = [1, 0, -1, -2]; // Movement values
const types: ('chord' | 'scale' | 'chromatic')[] = ['chord', 'chord' , 'chromatic', 'scale']; // Single type applies to all

// Parse the user input into modifications
const modifications = parseModifications(deltas, types);

// The rest of the program remains unchanged

const chord = [0, 4, 7];  // Major triad
const scale = [0, 2, 4, 5, 7, 9, 11];  // Major scale
const chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Chromatic scale
const mod = 12;

// Test notes (C4 and D4)
const testNotes = [60, 62];

// First, get hierarchical analysis for both notes
const analysisResults = testNotes.map(note => 
    hierarchy(note, chord, scale, chromatic, mod)
);

// Print the formatted analysis
console.log(formatOutput(testNotes, chord, scale, chromatic, mod, analysisResults));

// Use parsed modifications in tripleSelect
console.log('\nTripleSelect Results:');
testNotes.forEach((note, index) => {
    const { results: selectedNotes, isOut } = tripleSelect(
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
    modifications.forEach((mod, modIndex) => {
        console.log(formatModification(mod, isOut[modIndex]));
    });
});
