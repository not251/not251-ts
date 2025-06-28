type SequenceInfo = {
    sequence: number[];
    scale: string;
    root: string;
    degrees: number[];
};

let scales: { [key: string]: number[] } = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "harm minor": [0, 2, 3, 5, 7, 8, 11],
    "mel minor": [0, 2, 3, 5, 7, 9, 11],
};

let noteNames: string[] = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function detectionLogic(inNotes: number[], index: number): SequenceInfo {
    let out: SequenceInfo = { sequence: [], scale: "", root: "", degrees: [] };

    let preferredScales: string[] = ["major", "minor", "harm minor", "mel minor"];
    let circleOfFifths: number[] = [0, 7, 5, 2, 9, 4, 11, 6, 1, 8, 3, 10];

    for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
        let assumedRoot = circleOfFifths[rootIndex];
        for (let scaleType of preferredScales) {
            let currentSequence: number[] = [];
            let currentDegrees: number[] = [];

            for (let i = index; i < inNotes.length; i++) {
                let note = inNotes[i];
                let normalizedNote = (note - assumedRoot + 12) % 12;
                let degree = -1;

                for (let j = 0; j < scales[scaleType].length; j++) {
                    if (scales[scaleType][j] === normalizedNote) {
                        degree = j + 1;
                        break;
                    }
                }

                if (degree === -1) {
                    break;
                }

                currentDegrees.push(degree);
                currentSequence.push(note);
            }

            if (currentSequence.length > out.sequence.length) {
                out.sequence = currentSequence;
                out.scale = scaleType;
                out.root = noteNames[assumedRoot];
                out.degrees = currentDegrees;
            }
        }
    }

    return out;
}

function scaleDetector(inNotes: number[]): SequenceInfo[] {
    let index = 0;
    let out: SequenceInfo[] = [];

    while (index < inNotes.length) {
        let maxSequence = detectionLogic(inNotes, index);
        out.push(maxSequence);
        
        index += maxSequence.sequence.length;
    }

    return out;
}

let notes = [64, 66, 68, 69, 71, 64, 64, 66, 71, 64, 64, 63, 64, 71, 72, 75, 76, 77, 80, 81];

let detected = scaleDetector(notes);

detected.forEach((seqInfo, i) => {
    console.log(`\nsequence ${i + 1}: ${seqInfo.sequence.map(note => noteNames[note % 12]).join(' ')}`);
    console.log(`degrees: ${seqInfo.degrees.join(' ')}`);
    console.log(`scale: ${seqInfo.scale}`);
    console.log(`root: ${seqInfo.root}`);
});
