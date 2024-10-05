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
function normalize(input) {
    var sum = input.reduce(function(acc, val) {
        return acc + val;
    }, 0);
    if (sum === 0) {
        throw new Error("Sum of vector elements is zero, cannot normalize");
    }

    return input.map(function(val) {
        return val / sum;
    });
}

function computeCDF(pdf) {
    var cdf = [];
    pdf.reduce(function(acc, val) {
        cdf.push(acc + val);
        return acc + val;
    }, 0);
    return cdf;
}

function earthMoversDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Input vectors must have the same size");
    }

    var f1 = normalize(v1);
    var f2 = normalize(v2);
    var cdfF1 = computeCDF(f1);
    var cdfF2 = computeCDF(f2);

    return cdfF1.reduce(function(emd, val, i) {
        return emd + Math.abs(val - cdfF2[i]);
    }, 0);
}

function kolmogorovDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Input vectors must have the same size");
    }

    var f1 = normalize(v1);
    var f2 = normalize(v2);

    return f1.reduce(function(kolDist, val, i) {
        return kolDist + Math.abs(val - f2[i]);
    }, 0);
}

function mahalanobisDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Input vectors must have the same size");
    }

    var f1 = normalize(v1);
    var f2 = normalize(v2);

    var sum = f1.reduce(function(acc, val, i) {
        return acc + Math.pow(val - f2[i], 2);
    }, 0);

    return Math.sqrt(sum / f1.length);
}

function kullbackLeiblerLDivergence(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Input vectors must have the same size");
    }

    var f1 = normalize(v1);
    var f2 = normalize(v2);

    var klDiv = 0;
    for (var i = 0; i < f1.length; i++) {
        if (f1[i] > 0 && f2[i] > 0) {
            klDiv += f1[i] * Math.log(f1[i] / f2[i]);
        }
    }

    return 1 - klDiv;
}

function levenshteinDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Vectors must be of the same length");
    }

    return v1.reduce(function(changes, val, i) {
        return changes + (val !== v2[i] ? 1 : 0);
    }, 0);
}

function hammingDistance(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Vectors must have the same size");
    }

    return v1.reduce(function(distance, val, i) {
        return distance + (val !== v2[i] ? 1 : 0);
    }, 0);
}

function cosineSimilarity(v1, v2) {
    if (v1.length !== v2.length) {
        throw new Error("Input vectors must have the same size");
    }

    var dotProduct = v1.reduce(function(acc, val, i) {
        return acc + val * v2[i];
    }, 0);
    var f1 = Math.sqrt(v1.reduce(function(acc, val) {
        return acc + val * val;
    }, 0));
    var f2 = Math.sqrt(v2.reduce(function(acc, val) {
        return acc + val * val;
    }, 0));

    return 1 - dotProduct / (f1 * f2);
}

function totalVariationDistance(v1, v2) {
    var pA = normalize(v1);
    var pB = normalize(v2);

    return pA.reduce(function(sum, val, i) {
        return sum + Math.abs(val - pB[i]);
    }, 0) / 2;
}

function jaccardIndex(v1, v2) {
    var intersection = 0;
    var union_ = 0;

    for (var i = 0; i < v1.length; i++) {
        if (v1[i] === 1 || v2[i] === 1) {
            union_++;
            if (v1[i] === 1 && v2[i] === 1) {
                intersection++;
            }
        }
    }

    return 1 - intersection / union_;
}

function jensenShannonDivergence(v1, v2) {
    var f1 = normalize(v1);
    var f2 = normalize(v2);
    var m = f1.map(function(val, i) {
        return (val + f2[i]) / 2;
    });

    var klDivergence = function(p, q) {
        return p.reduce(function(divergence, val, i) {
            if (val > 0) {
                return divergence + val * Math.log2(val / q[i]);
            }
            return divergence;
        }, 0);
    };

    return (klDivergence(f1, m) + klDivergence(f2, m)) / 2;
}

function hellingerDistance(v1, v2) {
    var f1 = normalize(v1);
    var f2 = normalize(v2);

    var sum = f1.reduce(function(acc, val, i) {
        return acc + Math.pow(Math.sqrt(val) - Math.sqrt(f2[i]), 2);
    }, 0);

    return Math.sqrt(sum) / Math.sqrt(2);
}

    let sum = f1.reduce((acc, val, i) => acc + Math.pow(Math.sqrt(val) - Math.sqrt(f2[i]), 2), 0);

    return Math.sqrt(sum) / Math.sqrt(2);
}
