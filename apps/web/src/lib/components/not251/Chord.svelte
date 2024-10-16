<script lang="ts">
	import * as not251 from '@not251/not251';
	import * as Tone from 'tone';
	import { Slider } from '$lib/components/ui/slider';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { scaleNotes } from './store';
	import Keyboard from '../keyboard/Keyboard.svelte';

	$effect(() => {
		scala = $scaleNotes;
	});

	let scala: not251.positionVector = $state($scaleNotes);
	let grado: number[] = $state([0]);
	let preVoices: number[] = $state([3]);
	let position: number[] = $state([0]);
	let postVoices: number[] = $state([3]);
	let root: number[] = $state([0]);
	let octave: number[] = $state([3]);
	let isInvert: boolean = $state(false);
	let isNegative: boolean = $state(false);
	let standardNegative: boolean = $state(true);
	let negativePos: number[] = $state([10]);

	let chordNotes = $derived(
		not251.chord({
			scala: scala,
			grado: grado[0],
			preVoices: preVoices[0],
			position: position[0],
			postVoices: postVoices[0],
			root: root[0],
			octave: octave[0] + 2,
			isInvert: isInvert,
			isNegative: isNegative,
			standardNegative: standardNegative,
			negativePos: negativePos[0]
		})
	);

	function play(notes: number[]) {
		const synth = new Tone.PolySynth(Tone.Synth).toDestination();
		let actualNotes: number[] = [];
		notes.forEach((note) => {
			actualNotes.push(Tone.Midi(note).toFrequency());
		});
		synth.triggerAttackRelease(actualNotes, '8n');
	}
</script>

<Card.Root class="w-full max-w-prose">
	<Card.Header>
		<Card.Title>Chord</Card.Title>
		<Card.Description>Demo for Chord generation</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col gap-10">
			<Label for="grado">Grado: {grado[0] + 1}</Label>
			<Slider id="grado" bind:value={grado} max={7} step={1} />
			<Label for="preVoices">Pre-Voices: {preVoices}</Label>
			<Slider id="preVoices" bind:value={preVoices} min={1} max={7} step={1} />
			<Label for="position">Position: {position}</Label>
			<Slider id="position" bind:value={position} min={0} max={7} step={1} />
			<Label for="postVoices">Post-Voices: {postVoices}</Label>
			<Slider id="postVoices" bind:value={postVoices} min={1} max={7} step={1} />
			<Label for="root">Root: {root[0]}</Label>
			<Slider id="root" bind:value={root} max={11} step={1} />
			<Label for="octave">Octave: {octave}</Label>
			<Slider id="octave" bind:value={octave} min={-2} max={8} step={1} />

			<div class="flex items-center space-x-2">
				<Switch id="isInvert" bind:checked={isInvert} />
				<Label for="isInvert">Invert</Label>
			</div>

			<div class="flex items-center space-x-2">
				<Switch id="isNegative" bind:checked={isNegative} />
				<Label for="isNegative">Negative</Label>
			</div>

			<div class="flex items-center space-x-2">
				<Switch id="standardNegative" bind:checked={standardNegative} />
				<Label for="standardNegative">Standard Negative</Label>
			</div>

			<Label for="negativePos">Negative Position: {negativePos}</Label>
			<Slider id="negativePos" bind:value={negativePos} min={0} max={11} step={1} />
		</div>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full flex-col gap-10">
			<Button on:click={() => play(chordNotes.data)}>Play</Button>
			<Keyboard middleC={60} octaves={octave[0]} keysPressed={chordNotes.data} />

			<p>Result: {JSON.stringify(chordNotes.data, null, 2)}</p>
		</div>
	</Card.Footer>
</Card.Root>
