import type { intervalVector, positionVector } from '@not251/not251';

export type ScaleType = {
	options: {
		intervals: intervalVector;
		modo: number[];
		grado: number[];
		root: number[];
		isInvert: boolean;
		isMirror: boolean;
		mirrorLeft: boolean;
		mirrorPos: number[];
	};
	notes: positionVector;
};

export type ChordType = {
	options: {
		scale: positionVector;
		octave: number[];
		preVoices: number[];
		position: number[];
		postVoices: number[];
		isInvert: boolean;
		isNegative: boolean;
		standardNegative: boolean;
		negativePos: number[];
	};
	notes: positionVector;
};
