/**
 * Adjusts the value of 'n' until it is at least as large as 'k' by incrementally adding 'n.value' to itself.
 * This function ensures that 'n.value' is equal to or greater than 'k' by scaling 'n' upwards.
 * @param n An object containing the value to be updated.
 * @param k The target threshold that 'n.value' must reach or exceed.
 */
function updateLength(n: { value: number }, k: number): void {
    let temp = n.value;
    while (temp < k) {
        temp += n.value;
    }
    n.value = temp;
}

/**
 * Generates a Euclidean rhythm pattern based on two parameters.
 * This recursive algorithm divides 'n' events across 'k' slots using the Euclidean algorithm.
 * The result is an array of integers representing evenly distributed rhythmic events.
 * @param n The total number of steps.
 * @param k The number of events.
 * @returns An array representing the Euclidean rhythm distribution.
 */
function euclidean(n: number, k: number): number[] {
    let out: number[] = [];
    
    if (n % k === 0) {
        let quotient = Math.floor(n / k);
        for (let i = 0; i < k; i++) {
            out.push(quotient);
        }
    } else {
        let a = n % k;
        let x = euclidean(k, a);
        let quotient = Math.floor(n / k);
        for (let i = 0; i < a; i++) {
            for (let j = 0; j < x[i] - 1; j++) {
                out.push(quotient);
            }
            out.push(quotient + 1);
        }
    }

    return out;
}

/**
 * Calculates the positions of rhythmic events within a specified number of steps.
 * Uses the Clough-Douthett algorithm to create a rhythm pattern with evenly spaced events.
 * @param steps The total number of steps in the rhythm.
 * @param events The number of rhythmic events or beats to be placed within the steps.
 * @returns An array of integers representing event positions in the rhythm.
 */
function CloughDouthett(steps: number, events: number): number[] {
    let out: number[] = [];
    for (let i = 0; i < events; i++) {
        out.push(Math.floor(i * steps / events));
    }
    return out;
}


/**
 * Generates a rhythm pattern based on modular arithmetic.
 * Calculates the positions of events distributed across 'n' steps, separated by 'm' intervals.
 * The positions are sorted to represent a rhythmic sequence with a given periodicity.
 * @param n The total number of steps in the rhythm.
 * @param k The number of rhythmic events.
 * @param m The step interval for event placement.
 * @returns An array of integers representing the rhythm positions in ascending order.
 */
function deepRhythm(n: number, k: number, m: number): number[] {
    let out: number[] = [];
    for (let i = 0; i < k; i++) {
        out.push((i * m) % n);
    }
    out.sort((a, b) => a - b);

    return out;
}

/**
 * Distributes rhythmic events with groups of zeros based on the given parameters.
 * Alternates between events and groups of zeros, where the group size is determined by 'g'.
 * This function manages both events and rests across a sequence of length 'n'.
 * @param n The total sequence length.
 * @param k The number of events.
 * @param g The size of each group of zeros between events.
 * @returns An array representing the distribution of events and rests.
 */
function groupingDistribution(n: number, k: number, g: number): number[] {
    let out: number[] = [];
    
    let remainingLength = n;
    let remainingZeros = n - k;
    
    while (k > 0) {
        out.push(1);
        k--;
        remainingLength--;

        for (let i = 0; i < g - 1 && remainingLength > 0 && remainingZeros > 0; i++) {
            out.push(0);
            remainingLength--;
            remainingZeros--;
        }
    }

    while (remainingLength > 0) {
        out.push(0);
        remainingLength--;
        remainingZeros--;
    }

    return out;
}

/**
 * Distributes events evenly over a specified length, aiming for maximal spacing between events.
 * Marks event positions based on the computed interval length between events.
 * @param n The total sequence length.
 * @param k The number of events to distribute.
 * @returns An array representing the distribution with 1s for events and 0s for gaps.
 */
function midpointDistribution(n: number, k: number): number[] {
    let out: number[] = new Array(n).fill(0);
    let interval = n / k;

    for (let event = 0; event < k; event++) {
        let position = Math.round(interval * event);
        position = Math.min(position, n - 1);
        out[position] = 1;
    }

    return out;
}

/**
 * Divides a sequence into groups, with each group containing one event followed by zeros.
 * Any remainder that does not fit into groups of 'g' length is added at a specified position.
 * @param n The total length of the sequence.
 * @param g The number of elements per group.
 * @param p The insertion point for any remainder group within the main sequence.
 * @returns An array representing the group distribution with events and rests.
 */
function subdiv(n: number, g: number, p: number): number[] {
    let length = n;
    
    if (n % g !== 0) {
        length -= n % g;
    }

    let out: number[] = [];
    for (let i = 0; i < length; i += g) {
        out.push(1);
        for (let j = 1; j < g; j++) {
            out.push(0);
        }
    }

    let irregular: number[] = [];
    if (out.length < n) {
        irregular.push(1);
        while (irregular.length < n - length) {
            irregular.push(0);
        }
    }

    let index = p * g;
    if (index > out.length) {
        index = out.length;
    }
    out.splice(index, 0, ...irregular);

    return out;
}

/**
 * Replaces all zeros in an array with incremental values to indicate rest positions.
 * Converts zeros into a count-up sequence to differentiate between rests of varying lengths.
 * @param input The array containing 1s and 0s (events and rests).
 * @returns An array where zeros are replaced by an incrementing sequence starting from 2.
 */
function fillZeros(input: number[]): number[] {
    let out: number[] = [];
    let count = 0;

    for (let value of input) {
        if (value === 1) {
            out.push(1);
            count = 2;
        } else {
            out.push(count++);
        }
    }

    return out;
}

/**
 * Generates a binary inverse of the input array by flipping 1s and 0s.
 * This transformation is often used to produce complementary rhythms.
 * @param input The binary array containing 1s and 0s.
 * @returns A new array where all 1s are flipped to 0s and vice versa.
 */
function binaryGhost(input: number[]): number[] {
    let out: number[] = [];
    
    for (let value of input) {
        if (value === 0) {
            out.push(1);
        } else if (value === 1) {
            out.push(0);
        }
    }

    return out;
}

let n = 11; // numero di suddivisioni del ciclo
let k = 4;  // numero di eventi
let m = k;  // molteplicità nel deep rhythm 
let g = 4;  // lunghezza dei gruppi
let p = n;  // posizione degli eventuali gruppi di resto

updateLength({ value: n }, k);

console.log("\neuclidean:");
let euclid = euclidean(n, k);
console.log(euclid.join(' '));

console.log("Clough-Douthett:");
let clough = CloughDouthett(n, k);
console.log(clough.join(' '));

console.log("deep rhythm:");
let rhythm = deepRhythm(n, k, m);
console.log(rhythm.join(' '));

console.log("grouped:");
let grouped = groupingDistribution(n, k, g);
console.log(grouped.join(' '));

console.log("midpoint:");
const midpoint = midpointDistribution(n, k);
console.log(midpoint.join(' '));

updateLength({ value: n }, g);
console.log("subdivision of n by g, irregularity at position p:");
const subdivided = subdiv(n, g, p);
console.log(subdivided.join(' '));
