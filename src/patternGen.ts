function updateLength(n: { value: number }, k: number): void {
    let temp = n.value;
    while (temp < k) {
        temp += n.value;
    }
    n.value = temp;
}

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

function CloughDouthett(steps: number, events: number): number[] {
    let out: number[] = [];
    for (let i = 0; i < events; i++) {
        out.push(Math.floor(i * steps / events));
    }
    return out;
}

function deepRhythm(n: number, k: number, m: number): number[] {
    let out: number[] = [];
    for (let i = 0; i < k; i++) {
        out.push((i * m) % n);
    }
    out.sort((a, b) => a - b);

    return out;
}

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
