function divideMod(mod: number, m: number, d: number): number[] {
    const results: number[] = [];
    const maxValue = m * mod;
    const step = Math.floor(maxValue / d);
    
    for (let i = 0; i <= d; i++) {
        results.push(i * step);
    }
    return results;
}

function insert(
    vector: number[],
    ranges: { min: number; max: number }[],
    n: number,
    combinations: number[][],
    currentCombination: number[][],
    type: number,
    index: number = 0
) {
    if (index === ranges.length) {
        let finalVector: number[] = [];
        for (let i = 0; i < vector.length - 1; i++) {
            finalVector.push(vector[i]);
            if (currentCombination[i]) {
                finalVector.push(...currentCombination[i]);
            }
        }
        finalVector.push(vector[vector.length - 1]);
        combinations.push(finalVector);
        return;
    }

    const { min, max } = ranges[index];
    if (max - min + 1 < n) {
        insert(vector, ranges, n, combinations, [...currentCombination, []], type, index + 1);
        return;
    }

    let generated: number[][];
    switch (type) {
        case 0:
            generated = generateInterpolations(min, max, n);
            break;
        case 1:
            generated = generateUltrapolations(max, min, n);
            break;
        case 2:
            generated = generateInfrapolations(min, max, n);
            break;
        default:
            throw new Error("Invalid type.");
    }

    generated.forEach((combination) => {
        insert(vector, ranges, n, combinations, [...currentCombination, combination], type, index + 1);
    });
}


function generateInterpolations(min: number, max: number, count: number): number[][] {
    const results: number[][] = [];

    function helper(start: number, combination: number[]) {
        if (combination.length === count) {
            results.push([...combination]);
            return;
        }

        for (let i = start; i <= max; i++) {
            combination.push(i);
            helper(i + 1, combination);
            combination.pop();
        }
    }

    helper(min, []);
    return results;
}

function generateUltrapolations(max: number, min: number, count: number): number[][] {
    const results: number[][] = [];

    function helper(start: number, combination: number[]) {
        if (combination.length === count) {
            results.push([...combination]);
            return;
        }

        for (let i = start; i >= min; i--) {
            combination.push(i);
            helper(i - 1, combination);
            combination.pop();
        }
    }

    helper(max, []);
    return results;
}

function generateInfrapolations(min: number, max: number, count: number): number[][] {
    const results: number[][] = [];

    function helper(start: number, combination: number[]) {
        if (combination.length === count) {
            results.push([...combination]);
            return;
        }

        for (let i = start; i <= max; i++) {
            combination.push(i);
            helper(i + 1, combination);
            combination.pop();
        }
    }

    helper(min, []);
    return results;
}

function interpolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];
    const ranges = vector.map((_, i) => ({ min: vector[i] + 1, max: vector[i + 1] - 1 })).slice(0, -1);
    insert(vector, ranges, n, combinations, [], 0);
    return combinations;
}

function ultrapolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];
    const ranges = vector.map((_, i) => i < vector.length - 2
        ? { min: vector[i + 1] + 1, max: vector[i + 2] - 1 }
        : { min: vector[i + 1] + 1, max: vector[i + 1] + (vector[i + 1] - vector[i]) - 1 }
    ).slice(0, -1);
    insert(vector, ranges, n, combinations, [], 1);
    return combinations;
}

function infrapolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];
    const ranges = vector.map((_, i) => i === 0
        ? { min: vector[0] - vector[1] + 1, max: vector[0] - 1 }
        : { min: vector[i - 1] + 1, max: vector[i] - 1 }
    ).slice(0, -1);
    insert(vector, ranges, n, combinations, [], 2);
    return combinations;
}


function main() {
    const mod = 12;
    const m = 1;
    const d = 2;
    const n = 5;
    
    const vector = divideMod(mod, m, d);
    console.log(vector);
    const interpolations = interpolate(vector, n);
    console.log(interpolations);
    const ultrapolations = ultrapolate(vector, n);
    console.log(ultrapolations);
    const infrapolations = infrapolate(vector, n);
    console.log(infrapolations);
}

main();
