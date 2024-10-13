import { writable } from 'svelte/store';
import * as not251 from '@not251/not251';

export const scaleNotes = writable<not251.positionVector>(not251.scale());
