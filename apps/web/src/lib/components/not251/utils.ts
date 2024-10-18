import { intervalVector, positionVector } from '@not251/not251';
import type { ChordType, ScaleType } from './types';

export const initScaleOptions: Pick<ScaleType, 'options'>['options'] = {
	intervals: new intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0),
	modo: [0],
	grado: [0],
	root: [0],
	isInvert: false,
	isMirror: false,
	mirrorLeft: false,
	mirrorPos: [0]
};

export const initChordOptions: Pick<ChordType, 'options'>['options'] = {
	scale: new positionVector([0, 2, 4, 5, 7, 9, 11], 12, 0),
	negativePos: [0],
	octave: [3],
	preVoices: [3],
	position: [0],
	postVoices: [3],
	isInvert: false,
	isNegative: false,
	standardNegative: false
};
