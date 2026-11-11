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
 * Generates an array of numbers where the first and last elements are equal to the degree,
 * and middle elements form a sequence that either increases or decreases.
 * 
 * @param degree - The value to use for the first and last elements of the array
 * @param length - The desired length of the resulting array
 * @param up - If true, middle elements increase; if false, they decrease
 * @returns An array of numbers with the specified pattern. Returns empty array if length <= 0
 */
function diminution(degree: number, length: number, up: boolean): number[] {
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
    
    // Fill the middle values
    for (let i = 1; i < length - 1; i++) {
        if (up) {
            result[i] = firstNum + (i - 1);
        } else {
            result[i] = firstNum - (i - 1);
        }
    }
    
    return result;
}

/**
 * Generates a vector based on a degree, length, and shape, ensuring the result ends with the shape pattern.
 * 
 * @param degree - The central value (e.g., scale degree) around which the pattern is created.
 * @param length - The total number of elements in the resulting vector.
 * @param shape - A repeating pattern of relative offsets to apply to the degree.
 * @returns A vector of numbers of the specified length, ending with the shape pattern.
 */
function embellishment(degree: number, length: number, shape: number[]): number[] {
    const result: number[] = [];
    const shapeLength = shape.length;

    // Calculate how many elements need to fill before the final shape
    const remainingLength = length - shapeLength;
    // Calculate the offset to align the final shape at the end of the vector
    const offset = shapeLength - (remainingLength % shapeLength);

    for (let i = 0; i < length; i++) {
        // Calculate the corresponding index in the shape pattern
        const shapeIndex = ((i + offset) % shapeLength);
        // Add the degree to the current shape value
        result.push(degree + shape[shapeIndex]);
    }

    return result;
}

// Test cases 

console.log("Run (ascending scale of 7 notes) approaching 5th degree:", run(0, 7, true));  
// Output: [-6, -5, -4, -3, -2, -1, 0]  (ascending scale ending on the first degree)

console.log("Run (descending scale of 7 notes) approaching 5th degree:", run(4, 7, false)); 
// Output: [10, 9, 8, 7, 6, 5, 4]  (descending scale ending on the fifth degree)

console.log("Run (ascending scale) from 4th degree to 9th degree:", run2(3, 8));
// Output: [3, 4, 5, 6, 7, 8]
console.log("Run (descending scale) from 9th degree to 4th degree:", run2(3, 8));
console.log(run2(8, 3)); // Output: [8, 7, 6, 5, 4, 3]

console.log("Diminution (5 increasing notes on 1st degree):");
console.log(diminution(0, 5, true));  
// [0, -3, -2, -1, 0]

console.log("Diminution (5 decreasing notes on 1st degree):");
console.log(diminution(0, 5, false));  
// [0, 3, 2, 1, 0]

console.log("Diminution (6 increasing notes on 5th degree):"),
console.log(diminution(4, 6, true));  
 // [4, 0, 1, 2, 3, 4]

console.log("Diminution (6 decreasing notes on 5th degree):"),
console.log(diminution(4, 6, false));  
// [4, 8, 7, 6, 5, 4]

console.log("Embellishment (gruppetto around 1st degree):", embellishment(0, 6, [1, 0, -1, 0]));  
// Output: [1, 0, -1, 0, 1, 0]  (gruppetto pattern around the first degree)

console.log("Embellishment (gruppetto around 5th degree):", embellishment(5, 4, [1, 0, -1, 0]));  
// Output: [6, 5, 4, 5]  (gruppetto pattern around the fifth degree)

console.log("Embellishment (trill on the 6th degree):", embellishment(5, 6, [1, 0]));  
// Output: [6, 5, 6, 5, 6, 5]  (trill pattern around the sixth degree)

console.log("Embellishment (descending mordent on the 3rd degree):", embellishment(2, 3, [-1, 0]));  
// Output: [2, 1, 2]  (mordent pattern on the third degree)

console.log("Embellishment (double descending mordent on the 1st degree):", embellishment(0, 4, [-1, 0]));  
// Output: [-1, 0, -1, 0]  (double mordent pattern around the first degree)

console.log("Embellishment (double mordent with gruppetto on the 1st degree):", embellishment(0, 8, [1, 0, 1, 0, -1, 0]));  
// Output: [-1, 0, 1, 0, 1, 0, -1, 0]   (double mordent with gruppetto)
