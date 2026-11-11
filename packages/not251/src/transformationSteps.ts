function generalizedNeoRiemann(input: number[], position: number, shift: number): number[] {
    const output = [...input];
    if (position >= 0 && position < input.length) {
        output[position] += shift;
    }
    return output;
}

function transformationSteps(start: number[], end: number[]): Array<[number, [number, number]]> {
    const steps: Array<[number, [number, number]]> = [];
    const startLength = start.length;
    const endLength = end.length;
    const minLength = Math.min(startLength, endLength);

    let addedPosition = startLength;

    for (let i = 0; i < minLength; ++i) {
        const diff = end[i] - start[i];
        if (diff !== 0) {
            steps.push([0, [i, diff]]);
            const transformed = generalizedNeoRiemann(start, i, diff);
            const substeps = transformationSteps(transformed, end);
            steps.push(...substeps);
            return steps;
        }
    }

    if (endLength > startLength) {
        for (let i = minLength; i < endLength; ++i) {
            steps.push([1, [addedPosition, end[i]]]);
            addedPosition++;
        }
    }

    if (endLength < startLength) {
        for (let i = minLength; i < startLength; ++i) {
            steps.push([2, [i, start[i]]]);
        }
    }

    return steps;
}

function applyTransformationSteps(input: number[], steps: Array<[number, [number, number]]>): number[] {
    const output = [...input];
    let diff = 0;

    for (const step of steps) {
        const [type, [position, value]] = step;
        let updatedPosition = position + diff;

        if (type === 0) {
            if (updatedPosition >= 0 && updatedPosition < output.length) {
                output[updatedPosition] += value;
            }
        } else if (type === 1) {
            if (updatedPosition >= 0 && updatedPosition <= output.length) {
                output.splice(updatedPosition, 0, value);
                diff++;
            }
        } else if (type === 2) {
            if (updatedPosition >= 0 && updatedPosition < output.length) {
                output.splice(updatedPosition, 1);
                diff--;
            }
        }
    }

    return output;
}

function printSteps(steps: Array<[number, [number, number]]>): void {
    steps.forEach(step => {
        const [type, [position, value]] = step;
        console.log(`position: ${position}, `);
        if (type === 0) {
            console.log(`shift: ${value}`);
        } else if (type === 1) {
            console.log(`added: ${value}`);
        } else if (type === 2) {
            console.log(`removed: ${value}`);
        }
    });
}

function weightedTransformationDistance(start: number[], end: number[]): number {
    const steps = transformationSteps(start, end);
    return steps.reduce((distance, step) => {
        const weight = Math.abs(step[1][1]);
        return distance + weight;
    }, 0);
}

const start = [0, 4, 7];
const end = [-1, 2, 7];

console.log('\nstart:', start);
console.log('end:', end);

const steps = transformationSteps(start, end);
printSteps(steps);
const reconstructed = applyTransformationSteps(start, steps);

console.log('end (reconstructed):', reconstructed);
const distance = weightedTransformationDistance(start, end);
console.log('Weighted Transformation Distance:', distance);
