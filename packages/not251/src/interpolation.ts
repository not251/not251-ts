function divideMod(mod: number, m: number, d: number): number[] {
    const results: number[] = [];
    const maxValue = m * mod;
    const step = Math.floor(maxValue / d);
    
    for (let i = 0; i <= d; i++) {
        results.push(i * step);
    }
    return results;
}

function interpolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];

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

    const ranges: { min: number, max: number }[] = [];
    for (let i = 0; i < vector.length - 1; i++) {
        const rangeMin = vector[i] + 1;
        const rangeMax = vector[i + 1] - 1;
        ranges.push({ min: rangeMin, max: rangeMax });
    }

    function insertInterpolations(currentCombination: number[][], index: number) {
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
            insertInterpolations([...currentCombination, []], index + 1);
            return;
        }

        const interpolations = generateInterpolations(min, max, n);
        interpolations.forEach((combination) => {
            insertInterpolations([...currentCombination, combination], index + 1);
        });
    }

    insertInterpolations([], 0);
    return combinations;
}

function ultrapolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];

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

    const ranges: { min: number, max: number }[] = [];
    for (let i = 0; i < vector.length - 1; i++) {
        if (i < vector.length - 2) {
            const rangeMin = vector[i + 1] + 1;
            const rangeMax = vector[i + 2] - 1;
            ranges.push({ min: rangeMin, max: rangeMax });
        } else {
            const rangeMin = vector[i + 1] + 1;
            const rangeMax = vector[i + 1] + (vector[i + 1] - vector[i]) - 1;
            ranges.push({ min: rangeMin, max: rangeMax });
        }
    }

    function insertUltrapolations(currentCombination: number[][], index: number) {
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
            insertUltrapolations([...currentCombination, []], index + 1);
            return;
        }

        const ultrapolations = generateUltrapolations(max, min, n);
        ultrapolations.forEach((combination) => {
            insertUltrapolations([...currentCombination, combination], index + 1);
        });
    }

    insertUltrapolations([], 0);
    return combinations;
}

function infrapolate(vector: number[], n: number): number[][] {
    const combinations: number[][] = [];

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

    const ranges: { min: number; max: number }[] = [];
    for (let i = 0; i < vector.length - 1; i++) {
        if (i === 0) {
            const lowerBound = vector[0] - vector[1] + 1;
            const upperBound = vector[0] - 1;
            ranges.push({ min: lowerBound, max: upperBound });
        } else {
            const prevMin = vector[i - 1] + 1;
            const prevMax = vector[i] - 1;
            ranges.push({ min: prevMin, max: prevMax });
        }
    }

    function insertInfrapolations(currentCombination: number[][], index: number) {
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
            insertInfrapolations([...currentCombination, []], index + 1);
            return;
        }

        const infrapolations = generateInfrapolations(min, max, n);
        infrapolations.forEach((combination) => {
            insertInfrapolations([...currentCombination, combination], index + 1);
        });
    }

    insertInfrapolations([], 0);
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
