import { writable } from 'svelte/store';
import type { ChordType, ScaleType } from './types';
import { initChordOptions, initScaleOptions } from './utils';
import { scale as generateScale, chord as generateChord } from '@not251/not251';

export const scale = writable<ScaleType>({
	options: initScaleOptions,
	notes: generateScale()
});
export const chord = writable<ChordType>({
	options: initChordOptions,
	notes: generateChord()
});
