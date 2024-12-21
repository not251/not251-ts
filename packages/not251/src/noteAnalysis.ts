type VectorInfo = {
    position: number;
    degree: number;
    octave: number;
    noteValue: number;
};

type Analysis = {
    chord: VectorInfo;
    scale: VectorInfo;
    chromatic: VectorInfo;
};

function hierarchy(
    note: number,
    chord: number[],
    scale: number[],
    chromatic: number[],
    mod: number
): Analysis {
const info = (inputNote: number, vector: number[], mod: number): VectorInfo => {
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
        chord: info(note, chord, mod),
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
    const formatAnalysis = (type: string, info: VectorInfo, vectorLength: number) => {
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
        output += `\nAnalysis for MIDI note ${note} (index ${index}):\n`;
        output += `----------------------------------------\n`;
        output += formatAnalysis('Chromatic', results[index].chromatic, chromatic.length);
        output += formatAnalysis('Scale', results[index].scale, scale.length);
        output += formatAnalysis('Chord', results[index].chord, chord.length);
    });
    
    return output;
}

// Example usage
const chord = [0, 4, 7, 14];  // Major triad
const scale = [0, 2, 4, 5, 7, 9, 11];  // Major scale
const chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Chromatic scale
const mod = 12;

// Test with multiple MIDI notes
const testNotes = [62];  // C major scale fragment
const results = testNotes.map(note => 
    hierarchy(note, chord, scale, chromatic, mod)
);
console.log(formatOutput(testNotes, chord, scale, chromatic, mod, results));
