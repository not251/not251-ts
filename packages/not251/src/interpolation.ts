function divideMod(mod: number, m: number, d: number): number[] {
    const results: number[] = [];
    const maxValue = m * mod;
    const step = Math.floor(maxValue / d);
    
    for (let i = 0; i <= d; i++) {
        results.push(i * step);
    }
    return results;
}

function generateCombinations(allInterpolations: number[][], currentResult: number[], input: number[], inputPos: number, n: number): void {
    if (inputPos >= input.length - 1) {
        currentResult.push(input[input.length - 1]);
        allInterpolations.push([...currentResult]);
        currentResult.pop();
        return;
    }

    currentResult.push(input[inputPos]);

    const start = input[inputPos] + 1;
    const end = input[inputPos + 1] - 1;

    const currentNumbers: number[] = [];

    const generateNumbers = (pos: number, lastUsed: number) => {
        if (pos === n) {
            currentResult.push(...currentNumbers);
            generateCombinations(allInterpolations, currentResult, input, inputPos + 1, n);
            for (let i = 0; i < n; i++) {
                currentResult.pop();
            }
            return;
        }

        for (let i = lastUsed + 1; i <= end; i++) {
            if (end - i >= n - pos - 1) {
                currentNumbers.push(i);
                generateNumbers(pos + 1, i);
                currentNumbers.pop();
            }
        }
    };

    generateNumbers(0, start - 1);
    
    currentResult.pop();
}

function interpolateN(input: number[], n: number): number[][] {
    const allInterpolations: number[][] = [];
    const currentResult: number[] = [];
    
    generateCombinations(allInterpolations, currentResult, input, 0, n);
    
    return allInterpolations;
}

function main() {
    const mod = 12;
    const m = 1;
    const d = 2;
    const n = 1;
    
    const results = divideMod(mod, m, d);
    
    console.log("Original sequence: ", results.join(" "));
    
    console.log("All possible interpolations:");
    const allResults = interpolateN(results, n);
    
    for (const result of allResults) {
        console.log(result.join(" "));
    }
}

main();
