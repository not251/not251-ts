<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { chord } from './store.js';
	import { PolySynth, Synth, Midi } from 'tone';

	function play(midiNotes: number[]) {
		const synth = new PolySynth(Synth).toDestination();
		let notes: number[] = [];
		midiNotes.forEach((note) => {
			notes.push(Midi(note).toFrequency());
		});
		synth.triggerAttackRelease(notes, '8n');
	}
</script>

<Button class="w-full max-w-prose" on:click={() => play($chord.notes?.data ?? [])}>Play</Button>
