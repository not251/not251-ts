/**
 * Represents information about a musical note's position in different contexts
 */
type NoteInfo = {
    position: number;
    degree: number;
    octave: number;
    noteValue: number;
};

/**
 * Represents the analysis of a note in different musical contexts
 */
type Analysis = {
    chord: NoteInfo;
    scale: NoteInfo;
    chromatic: NoteInfo;
};
/**
 * Generates an array of numbers where the first and last elements are equal to the degree,
 * and middle elements form a sequence that either increases or decreases.
 * Optionally, the middle elements can be sorted in ascending or descending order.
 * 
 * @param degree - The value to use for the first and last elements of the array
 * @param length - The desired length of the resulting array
 * @param up - If true, middle elements increase; if false, they decrease
 * @param sortAscending - If true, sort middle elements in ascending order; if false, sort in descending order
 * @returns An array of numbers with the specified pattern. Returns empty array if length <= 0
 */
function diminution(degree: number, length: number, up: boolean, left: boolean): number[] {
    if (length <= 0) return [];
    if (length === 1) return [degree];

    const result: number[] = new Array(length);
    result[0] = degree;
    result[length - 1] = degree;

    // The distance from degree should be equal to length - 2
    const distance = length - 2;

    // Calculate the first number in the sequence
    const firstNum = up ? 
        degree - distance : 
        degree + distance;

    // Generate the middle values
    const middleValues: number[] = [];
    for (let i = 1; i < length - 1; i++) {
        if (up) {
            middleValues.push(firstNum + (i - 1));
        } else {
            middleValues.push(firstNum - (i - 1));
        }
    }

    // Sort the middle values based on sortAscending
    if (left) {
        middleValues.sort((a, b) => a - b);
    } else {
        middleValues.sort((a, b) => b - a);
    }

    // Insert the sorted middle values into the result
    for (let i = 0; i < middleValues.length; i++) {
        result[i + 1] = middleValues[i];
    }

    return result;
}

/**
 * Generates a vector of integers representing a run on the specified degree, length, and direction.
 * 
 * @param degree - The approach scale degree for the run.
 * @param length - The number of elements in the resulting vector.
 * @param direction - A boolean; `true` for increasing values, `false` for decreasing values.
 * @returns A vector of ascending or descending integers approaching "degree".
 */
function run(degree: number, length: number, direction: boolean): number[] {
    const step = direction ? 1 : -1; // Determine step direction (ascending or descending)
    const start = direction ? degree - (length - 1) : degree + (length - 1); // Calculate starting point
    return Array.from({ length }, (_, i) => start + i * step); // Generate vector
}

/**
 * Generates a vector of integers from `start` to `end`.
 * 
 * - If `start < end`, the vector is in ascending order.
 * - If `start > end`, the vector is in descending order.
 * 
 * @param start - The starting integer.
 * @param end - The ending integer.
 * @returns An array of integers from `start` to `end`.
 */
function run2(start: number, end: number): number[] {
    const result: number[] = [];
    
    if (start < end) {
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
    } else {
        for (let i = start; i >= end; i--) {
            result.push(i);
        }
    }
    
    return result;
}


/**
 * Normalizes an array of notes to fall within a specified modulo range.
 * Handles negative numbers by wrapping them into the positive range.
 * 
 * @param notes - Array of note values to normalize
 * @param mod - The modulo value to use for normalization
 * @returns Array of normalized note values
 */
function normalizeNotes(notes: number[], mod: number): number[] {
    return notes.map(note => {
        const normalized = note % mod;
        // Handle negative numbers correctly
        return normalized < 0 ? normalized + mod : normalized;
    });
}

/**
 * Analyzes a note's position in different musical hierarchies (chord, scale, chromatic).
 * 
 * @param note - The note value to analyze
 * @param chord - Array of chord note values
 * @param scale - Array of scale note values
 * @param chromatic - Array of chromatic note values
 * @param mod - The modulo value for note normalization
 * @returns Analysis object containing position information in each context
 */
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

/**
 * Formats analysis results into a readable string output.
 * 
 * @param notes - Array of input notes that were analyzed
 * @param chord - Array of chord note values
 * @param scale - Array of scale note values
 * @param chromatic - Array of chromatic note values
 * @param mod - The modulo value used in analysis
 * @param results - Array of Analysis objects for each input note
 * @returns Formatted string containing analysis results
 */
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

/**
 * Represents a modification to be applied to a note in a specific musical context
 */
type VectorModification = {
    type: 'chord' | 'scale' | 'chromatic';
    delta: number;
};

/**
 * Selects notes based on position modifications in different musical contexts.
 * 
 * @param analysis - Analysis object containing note positions in different contexts
 * @param modifications - Array of modifications to apply
 * @param chord - Array of chord note values
 * @param scale - Array of scale note values
 * @param chromatic - Array of chromatic note values
 * @param mod - The modulo value for note calculations
 * @returns Object containing selected notes and validity flags
 */
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

/**
 * Formats a vector modification into a readable string.
 * 
 * @param mod - The vector modification to format
 * @param isOut - Boolean indicating if the modification resulted in an invalid note
 * @returns Formatted string describing the modification
 */
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

/**
 * Parses arrays of deltas and types into VectorModification objects.
 * 
 * @param deltas - Array of position changes to apply
 * @param types - Array of context types or single type to apply to all deltas
 * @returns Array of VectorModification objects
 * @throws Error if deltas and types arrays have different lengths
 */
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

/**
 * Expands a vector from right to left before the first element,
 * repeating itself until a desired length is reached.
 * 
 * @param vector - The array of numbers to expand.
 * @param length - The desired length of the output vector.
 * @returns A new array expanded to the specified length.
 */
function ornamentLoop(vector: number[], length: number): number[] {
    if (length <= 0) return [];
    const result: number[] = [];
    const n = vector.length;

    while (result.length < length) {
        // Add elements from the end of the vector, wrapping around if necessary
        for (let i = n - 1; i >= 0 && result.length < length; i--) {
            result.unshift(vector[i]);
        }
    }

    // If the result exceeds the desired length, trim the excess from the front
    return result.slice(result.length - length);
}

/**
 * Expands a vector of modification types from right to left before the first element,
 * repeating itself until a desired length is reached.
 * 
 * @param types - The array of modification types to expand.
 * @param length - The desired length of the output vector.
 * @returns A new array of modification types expanded to the specified length.
 */
function ornamentTypesLoop(
    types: ('chord' | 'scale' | 'chromatic')[],
    length: number
): ('chord' | 'scale' | 'chromatic')[] {
    if (length <= 0) return [];
    const result: ('chord' | 'scale' | 'chromatic')[] = [];
    const n = types.length;

    while (result.length < length) {
        // Add elements from the end of the types array, wrapping around if necessary
        for (let i = n - 1; i >= 0 && result.length < length; i--) {
            result.unshift(types[i]);
        }
    }

    // If the result exceeds the desired length, trim the excess from the front
    return result.slice(result.length - length);
}

/**
 * Applies triple select operations to a set of notes using specified ornaments.
 * 
 * @param notes - Array of input notes to process
 * @param chord - Array of chord note values
 * @param scale - Array of scale note values
 * @param chromatic - Array of chromatic note values
 * @param mod - The modulo value for note calculations
 * @param ornaments - Array of position modifications to apply
 * @param types - Array of context types for the modifications
 */
function applyTripleSelect(
    notes: number[],
    chord: number[],
    scale: number[],
    chromatic: number[],
    mod: number,
    ornaments: number[],
    types: ('chord' | 'scale' | 'chromatic')[]
): void {
    // Expand types using the same looping logic as ornaments
    const expandedTypes = ornamentTypesLoop(types, ornaments.length);

    // Parse modifications from ornaments and expanded types
    const modifications = parseModifications(ornaments, expandedTypes);

    // Perform hierarchical analysis for each note
    const analysisResults = notes.map(note => hierarchy(note, chord, scale, chromatic, mod));

    // Apply tripleSelect to each note
    notes.forEach((note, index) => {
        const { results: selectedNotes, isOut } = tripleSelect(
            analysisResults[index],
            modifications,
            chord,
            scale,
            chromatic,
            mod
        );

        // Display results
        console.log(`\nMIDI note ${note}:`);
        console.log('Selected notes:', selectedNotes);
        //console.log('Modifications applied:');
        //modifications.forEach((mod, modIndex) => {
           // console.log(formatModification(mod, isOut[modIndex]));
        //});
    });
}


const chord = [0, 4, 7]; // Major triad
const scale = [0, 2, 4, 5, 7, 9, 11]; // Major scale
const chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Chromatic scale
const mod = 12; // Modulo
const testNotes = [60]; // Middle C


// Combined test cases using all ornament generation functions
const ornamentTests: {
    ornaments: number[];
    types: ('chord' | 'scale' | 'chromatic')[];
    description: string;
}[] = [
 { 
        ornaments: ornamentLoop([1, 0], 7), 
        types: ['scale'], 
        description: "Trill (7 notes)" 
    },
    { 
        ornaments: ornamentLoop([-1, 0], 5), 
        types: ['scale'], 
        description: "Double descending mordente (5 notes)" 
    },
    { 
        ornaments: ornamentLoop([1, 0, -1, 0], 5), 
        types: ['scale', 'chromatic'], 
        description: "Gruppetto (5 notes)" 
    },
    // Diminution patterns
    {
        ornaments: diminution(0, 4, false, true),
        types: ['scale'],
        description: "Diminution: Ascending scale (4 notes)"
    },
    {
        ornaments: diminution(0, 5, false, false),
        types: ['scale'],
        description: "Diminution: Descending scale (5 notes)"
    },
 {
        ornaments: diminution(0, 4, false, false),
        types: ['scale'],
        description: "Diminution: Descending scale (3 notes)"
    },
    
    // Run patterns
    {
        ornaments: run(4, 6, true),
        types: ['scale'],
        description: "Run: Ascending scale approach to degree 4 (6 notes)"
    },
    {
        ornaments: run(2, 4, false),
        types: ['chromatic'],
        description: "Run: Descending chromatic approach to degree 2 (4 notes)"
    },
    {
        ornaments: run(3, 5, true),
        types: ['chord'],
        description: "Run: Ascending chord approach to degree 3 (5 notes)"
    },
    
    // Run2 patterns
    {
        ornaments: run2(-2, 2),
        types: ['scale'],
        description: "Run2: Ascending scale from -2 to 2"
    },
    {
        ornaments: run2(3, -3),
        types: ['chromatic'],
        description: "Run2: Descending chromatic from 3 to -3"
    },
    
    // Combined patterns
    {
        ornaments: [...run(2, 3, true), ...diminution(2, 4, true, false)],
        types: ['scale'],
        description: "Combined: Ascending run followed by descending diminution"
    },
    {
        ornaments: [...run2(0, 3), ...run2(3, 0)],
        types: ['chord'],
        description: "Combined: Ascending-descending run2 pattern"
    },
    
    // Mixed scale context patterns
    {
        ornaments: run(2, 4, true),
        types: ['chord', 'chromatic', 'scale', 'scale'],
        description: "Mixed: Ascending run through different contexts"
    },
    
    // Longer complex patterns
    {
        ornaments: [
            ...diminution(0, 4, false, true),
            ...diminution(0, 4, false, true),  
            ...run2(2, 4),
            ...run2(2, 4)
        ],
        types: ['chord'],
        description: "Fra martino"
    },
    
];


ornamentTests.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`Ornament pattern: [${test.ornaments.join(', ')}]`);
    console.log(`Type: [${test.types.join(', ')}]`);
    
    // Apply the test case
    applyTripleSelect(
        testNotes,
        chord,
        scale,
        chromatic,
        mod,
        test.ornaments,
        test.types
    );
});
