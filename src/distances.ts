import positionVector from "./positionVector";
import { reduceVectors } from "./utility";

export function euclideanDistance(v1: number[], v2: number[]): number {
  let length = Math.min(v1.length, v2.length);
  let out = 0.0;

  for (let i = 0; i < length; ++i) {
    let diff = v1[i] - v2[i];
    out += diff * diff;
  }

  return Math.sqrt(out);
}

export function reducedEuclideanDistance(v1: number[], v2: number[]): number {
  let [r1, r2] = reduceVectors(v1, v2);
  return euclideanDistance(r1, r2);
}

export function minRotation(v1: positionVector, v2: positionVector): number {
  let minV = Math.min.apply(Math, v1.data);
  let diffOct = Math.floor(minV / v1.span) - Math.floor(v2.data[0] / v2.span);
  let size = v2.data.length;
  let i = diffOct * size;

  while (v2.data[i] <= minV) {
    i++;
  }

  while (v2.data[i] > minV) {
    i--;
  }

  return i;
}

export type distanceMapElement = {
  rotation: number;
  data: number[];
  distance: number;
};
export type distanceMap = distanceMapElement[];

export type optionMatrixElement = {
  rotation: number;
  data: number[];
};

export type optionMatrix = optionMatrixElement[];

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

export function sortByDistance(distances: distanceMap): distanceMap {
  let out: distanceMap = distances.slice();

  out.sort(function (left, right) {
    return left.distance - right.distance;
  });

  return out;
}

//change variables names
//da fare test
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
