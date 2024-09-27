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
  let diffOct =
    Math.floor(minV / v1.span) - Math.floor(v2.data[0] / v2.span) - 1;
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
