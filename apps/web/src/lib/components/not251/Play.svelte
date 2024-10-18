<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { chord } from './store.js';
	import { PolySynth, Synth, Midi } from 'tone';

	let autoplay: boolean = $state(false);

	function play(midiNotes: number[]) {
		const synth = new PolySynth(Synth).toDestination();
		let notes: number[] = [];
		midiNotes.forEach((note) => {
			notes.push(Midi(note).toFrequency());
		});
		synth.triggerAttackRelease(notes, '8n');
	}

	$effect(() => {
		if (autoplay) {
			play($chord.notes?.data ?? []);
		}
	});
</script>

<div class="flex w-full flex-col items-center justify-center gap-4 px-4">
	<div class="flex items-center space-x-2">
		<Switch id="isInvert" bind:checked={autoplay} />
		<Label for="isInvert">Auto Play</Label>
	</div>
	<Button class="w-full max-w-prose" on:click={() => play($chord.notes?.data ?? [])}>Play</Button>
</div>
