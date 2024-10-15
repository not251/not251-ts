import positionVector from "./positionVector";
import { reduceVectors } from "./utility";


// Calculates the Euclidean distance between two vectors, v1 and v2. 
// The function iterates through both vectors up to their shortest length, calculating the square of the difference for each element. 
// The sum of these squared differences is then square-rooted to return the Euclidean distance. 
// This represents how far apart the two vectors are in a multi-dimensional space.
// @param {number[]} v1 - The first vector for distance calculation.
// @param {number[]} v2 - The second vector for distance calculation.
// @returns {number} The Euclidean distance between v1 and v2.
export function euclideanDistance(v1: number[], v2: number[]): number {
  let length = Math.min(v1.length, v2.length);
  let out = 0.0;

  for (let i = 0; i < length; ++i) {
    let diff = v1[i] - v2[i];
    out += diff * diff;
  }

  return Math.sqrt(out);
}

// Computes the Euclidean distance between two vectors after they have been reduced to common dimensions by the reduceVectors function. 
// This ensures the vectors are comparable in terms of length and structure before calculating the Euclidean distance.
// @param {number[]} v1 - The first vector to be reduced and compared.
// @param {number[]} v2 - The second vector to be reduced and compared.
// @returns {number} The Euclidean distance between the reduced vectors.
export function reducedEuclideanDistance(v1: number[], v2: number[]): number {
  let [r1, r2] = reduceVectors(v1, v2);
  return euclideanDistance(r1, r2);
}

// Determines the minimal rotation needed for a positionVector (v2) to align its minimum element with the minimum element in another positionVector (v1). 
// It calculates an octave difference based on the smallest element in v1 and positions the rotation index accordingly. 
// The function iterates through v2 until the closest alignment is found, returning the rotation index at this point.
// @param {positionVector} v1 - The reference positionVector used for alignment.
// @param {positionVector} v2 - The positionVector that will be rotated.
// @returns {number} The rotation index needed for alignment.

//reference è il vettore che rimane fisso, target è quello che viene ruotato per arrivare a reference 
//potrei aver confuso il significato dei nomi, nel caso invertire la logica
export function minRotation(reference: positionVector, target: positionVector): number {
  let minV = Math.min.apply(Math, reference.data);
  let diffOct = Math.floor(minV / reference.span) - Math.floor(target.data[0] / target.span);
  let size = target.data.length;
  let i = diffOct * size;

  while (target.element(i) <= minV) {
    i++;
  }

  while (target.element(i) > minV) {
    i--;
  }

  return i;
}

// Represents an element in a map of distances. 
// This type is used to store the result of comparing a single rotation of a data set to another data set. 
// It encapsulates the rotation index, the rotated data, and the calculated distance.
export type distanceMapElement = {
  rotation: number;
  data: number[];
  distance: number;
};

// An array of distanceMapElement objects. 
// This type represents a collection of rotated data comparisons, each with its associated rotation index, data, and distance. 
// It’s useful for determining which rotation of the data set most closely matches a reference data set.
export type distanceMap = distanceMapElement[];

// Represents an element in an option matrix, which typically holds different rotation possibilities for a data set. 
// It includes the rotation index and the data in its rotated form.
export type optionMatrixElement = {
  rotation: number;
  data: number[];
};

// An array of optionMatrixElement objects. 
// This type is used to store various rotation possibilities of a data set, where each element represents a specific rotation and its corresponding data. 
// It’s often used as an input for functions that calculate distances to find the best match.
export type optionMatrix = optionMatrixElement[];

// Creates a map of Euclidean distances between a target vector (v) and each element in an optionMatrix. 
// Each element in the resulting distanceMap contains the rotation index, data vector, and distance value. 
// The function also provides an option to use reducedEuclideanDistance by setting isReduced to true.
// @param {optionMatrix} matrix - The matrix containing different rotation possibilities.
// @param {number[]} v - The target vector to compare against the options in the matrix.
// @param {boolean} isReduced - Flag indicating whether to use reduced Euclidean distance calculation.
// @returns {distanceMap} A map of distances between the target vector and the matrix elements.
export function euclideanDistanceMap(
  matrix: optionMatrix,
  v: number[],
  isReduced: boolean = false
): distanceMap {
  let out: distanceMap = [];

  for (let r in matrix) {
    let option = matrix[r];

    let distance = isReduced
      ? reducedEuclideanDistance(v, option.data)
      : euclideanDistance(v, option.data);

    let outElement: distanceMapElement = {
      rotation: option.rotation,
      data: option.data,
      distance: distance,
    };

    out.push(outElement);
  }

  return out;
}

// Sorts a distanceMap in ascending order based on the distance property of each element. 
// This allows you to prioritize closer matches to the target vector first. 
// The function returns a distanceMap with elements sorted by increasing distance.
// @param {distanceMap} distances - The distance map to be sorted.
// @returns {distanceMap} A sorted distanceMap in ascending order of distance.
export function sortByDistance(distances: distanceMap): distanceMap {
  let out: distanceMap = distances.slice();

  out.sort(function (left, right) {
    return left.distance - right.distance;
  });

  return out;
}

// Calculates the Levenshtein edit distance between two vectors, v1 and v2, using dynamic programming. 
// The function initializes a two-dimensional array (dp) to keep track of minimum edit operations needed to convert prefixes of v1 into prefixes of v2. 
// For each element in v1 and v2, the function checks if they are the same. 
// If not, it computes the minimum number of operations needed (insert, delete, replace) to make them equal. 
// The function returns the final value as the minimum edit distance, representing how many changes are needed to convert one vector into the other.
// @param {number[]} v1 - The first vector for calculating edit distance.
// @param {number[]} v2 - The second vector for calculating edit distance.
// @returns {number} The Levenshtein edit distance between v1 and v2.
export function editDistance(v1: number[], v2: number[]): number {
  var n = v1.length;
  var m = v2.length;
  var dp = new Array(n + 1);

  for (var i = 0; i <= n; i++) {
    dp[i] = new Array(m + 1);
    for (var j = 0; j <= m; j++) {
      dp[i][j] = 0;
    }
  }

  for (var i = 0; i <= n; i++) {
    dp[i][0] = i;
  }

  for (var j = 0; j <= m; j++) {
    dp[0][j] = j;
  }

  for (var i = 1; i <= n; i++) {
    for (var j = 1; j <= m; j++) {
      if (v1[i - 1] === v2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[n][m];
}


// other distances

/*
function normalize(inArr: number[]): number[] {
    let sum = inArr.reduce(function (acc, val) {
        return acc + val;
    }, 0);
    if (sum === 0) throw new Error("Sum of vector elements is zero, cannot normalize");

    let outArr = inArr.map(function (val) {
        return val / sum;
    });
    return outArr;
}

function computeCDF(pdf: number[]): number[] {
    let cdf = [];
    for (let i = 0; i < pdf.length; i++) {
        cdf[i] = (cdf[i - 1] || 0) + pdf[i];
    }
    return cdf;
}

function earthMoversDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return -1;

    let f1 = normalize(v1);
    let f2 = normalize(v2);
    let cdfF1 = computeCDF(f1);
    let cdfF2 = computeCDF(f2);

    let emd = 0;
    for (let i = 0; i < cdfF1.length; i++) {
        emd += Math.abs(cdfF1[i] - cdfF2[i]);
    }
    return emd;
}

function kolmogorovDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Input vectors must have the same size");

    let f1 = normalize(v1);
    let f2 = normalize(v2);

    let kolDist = 0;
    for (let i = 0; i < f1.length; i++) {
        kolDist += Math.abs(f1[i] - f2[i]);
    }
    return kolDist;
}

function mahalanobisDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Input vectors must have the same size");

    let f1 = normalize(v1);
    let f2 = normalize(v2);

    let sum = 0;
    for (let i = 0; i < f1.length; i++) {
        let diff = f1[i] - f2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum / f1.length);
}

function kullbackLeiblerDivergence(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Input vectors must have the same size");

    let f1 = normalize(v1);
    let f2 = normalize(v2);

    let klDiv = 0;
    for (let i = 0; i < f1.length; i++) {
        if (f1[i] > 0 && f2[i] > 0) {
            klDiv += f1[i] * Math.log(f1[i] / f2[i]);
        }
    }
    return 1 - klDiv;
}

function levenshteinDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Vectors must be of the same length");

    let changes = 0;
    for (let i = 0; i < v2.length; i++) {
        if (v1[i] !== v2[i]) {
            changes++;
        }
    }
    return changes;
}

function hammingDistance(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Vectors must have the same size");

    let distance = 0;
    for (let i = 0; i < v1.length; i++) {
        if (v1[i] !== v2[i]) {
            distance++;
        }
    }
    return distance;
}

function cosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) throw new Error("Vectors must have the same size");

    let dotProduct = 0;
    let magV1 = 0;
    let magV2 = 0;

    for (let i = 0; i < v1.length; i++) {
        dotProduct += v1[i] * v2[i];
        magV1 += v1[i] * v1[i];
        magV2 += v2[i] * v2[i];
    }

    return 1 - (dotProduct / (Math.sqrt(magV1) * Math.sqrt(magV2)));
}

function totalVariationDistance(v1: number[], v2: number[]): number {
    let pA = normalize(v1);
    let pB = normalize(v2);

    let sum = 0;
    for (let i = 0; i < pA.length; i++) {
        sum += Math.abs(pA[i] - pB[i]);
    }

    return sum / 2;
}

function jaccardIndex(v1: number[], v2: number[]): number {
    let intersection = 0;
    let union = 0;

    for (let i = 0; i < v1.length; i++) {
        if (v1[i] === 1 || v2[i] === 1) {
            union++;
            if (v1[i] === 1 && v2[i] === 1) {
                intersection++;
            }
        }
    }

    return 1 - (intersection / union);
}

function jensenShannonDivergence(v1: number[], v2: number[]): number {
    let f1 = normalize(v1);
    let f2 = normalize(v2);
    let m = f1.map(function (val, i) {
        return (val + f2[i]) / 2;
    });

function klDiv(p: number[], q: number[]) {
        let divergence = 0;
        for (let i = 0; i < p.length; i++) {
            if (p[i] > 0) {
                divergence += p[i] * Math.log2(p[i] / q[i]);
            }
        }
        return divergence;
    }

    return (klDiv(f1, m) + klDiv(f2, m)) / 2;
}

function hellingerDistance(v1: number[], v2: number[]): number {
    let f1 = normalize(v1);
    let f2 = normalize(v2);

    let sum = 0;
    for (let i = 0; i < f1.length; i++) {
        sum += Math.pow(Math.sqrt(f1[i]) - Math.sqrt(f2[i]), 2);
    }

    return Math.sqrt(sum) / Math.sqrt(2);
}
*/
