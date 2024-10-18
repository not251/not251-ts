<script lang="ts">
	import { chord as generateChord, intervalVector } from '@not251/not251';
	import { Slider } from '$lib/components/ui/slider';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { chord, scale } from './store';
	import { initChordOptions } from './utils';

	let options = $state(initChordOptions);

	let chordNotes = $derived(
		generateChord({
			grado: $scale.options.grado[0],
			root: $scale.options.root[0],
			isInvert: options.isInvert,
			isNegative: options.isNegative,
			standardNegative: options.standardNegative,
			negativePos: options.negativePos[0],
			preVoices: options.preVoices[0],
			position: options.position[0],
			postVoices: options.postVoices[0],
			octave: options.octave[0] + 2,
			scala: $scale.notes,
			selection: new intervalVector([2], 12, 0)
		})
	);

	$effect(() => {
		$chord = {
			options: {
				scale: options.scale,
				octave: options.octave,
				preVoices: options.preVoices,
				position: options.position,
				postVoices: options.postVoices,
				isInvert: options.isInvert,
				isNegative: options.isNegative,
				standardNegative: options.standardNegative,
				negativePos: options.negativePos
			},
			notes: chordNotes
		};
	});
</script>

<Card.Root class="w-full max-w-prose">
	<Card.Header>
		<Card.Title class="text-2xl">Chord</Card.Title>
		<Card.Description>Chord generation</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col gap-5">
			<div class="space-y-2">
				<Label for="preVoices">Pre-Voices: {options.preVoices}</Label>
				<Slider id="preVoices" bind:value={options.preVoices} min={1} max={7} step={1} />
			</div>
			<div class="space-y-2">
				<Label for="position">Position: {options.position}</Label>
				<Slider id="position" bind:value={options.position} min={0} max={7} step={1} />
			</div>
			<div class="space-y-2">
				<Label for="postVoices">Post-Voices: {options.postVoices}</Label>
				<Slider id="postVoices" bind:value={options.postVoices} min={1} max={7} step={1} />
			</div>
			<div class="space-y-2">
				<Label for="octave">Octave: {options.octave}</Label>
				<Slider id="octave" bind:value={options.octave} min={-2} max={8} step={1} />
			</div>

			<!-- SWITCHES -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center space-x-2">
					<Switch id="isInvert" bind:checked={options.isInvert} />
					<Label for="isInvert">Invert</Label>
				</div>

				<div class="flex items-center space-x-2">
					<Switch id="isNegative" bind:checked={options.isNegative} />
					<Label for="isNegative">Negative</Label>
				</div>

				<div class="flex items-center space-x-2">
					<Switch id="standardNegative" bind:checked={options.standardNegative} />
					<Label for="standardNegative">Standard Negative</Label>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="negativePos">Negative Position: {options.negativePos}</Label>
				<Slider id="negativePos" bind:value={options.negativePos} min={0} max={11} step={1} />
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex w-full items-center justify-center gap-2">
		<p>Chord Notes: {JSON.stringify($chord.notes?.data, null, 2)}</p>
	</Card.Footer>
</Card.Root>
