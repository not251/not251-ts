<script lang="ts">
	import * as not251 from '@not251/not251';
	import * as Tone from 'tone';
	import { writable } from 'svelte/store';
	import { Slider } from '$lib/components/ui/slider';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input/index.js';
	import { scaleNotes } from './store';

	// Stores for state management
	const intervals = writable([2, 2, 1, 2, 2, 2, 1]);
	const root = writable([0]);
	const grado = writable([0]);
	const modo = writable([0]);
	const isInvert = writable(false);
	const isMirror = writable(false);
	const mirrorLeft = writable(false);
	const mirrorPos = writable([0]);

	let intervalsValue = new not251.intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0);

	let scala: not251.positionVector;

	// Update the scaleNotes store whenever inputs change
	$: scaleNotes.set(
		not251.scale({
			intervals: intervalsValue,
			root: $root[0],
			grado: $grado[0],
			modo: $modo[0],
			isInvert: $isInvert,
			isMirror: $isMirror,
			mirrorLeft: $mirrorLeft,
			mirrorPos: $mirrorPos[0]
		})
	);

	// Subscribe to scaleNotes store to update scala
	scaleNotes.subscribe((value) => {
		scala = value;
	});
</script>

<Card.Root class="w-full max-w-prose">
	<Card.Header>
		<Card.Title>Scale</Card.Title>
		<Card.Description>Demo for Scale generation</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col gap-10">
			<Label for="modo">Modo: {$modo[0] + 1}</Label>
			<Slider id="modo" bind:value={$modo} min={0} max={7} step={1} />
			<Label for="grado">Grado: {$grado[0] + 1}</Label>
			<Slider id="grado" bind:value={$grado} max={7} step={1} />
			<Label for="root">Root: {$root[0]}</Label>
			<Slider id="root" bind:value={$root} max={11} step={1} />

			<div class="flex items-center space-x-2">
				<Label for="isInvert">Invert</Label>
				<Switch id="isInvert" bind:checked={$isInvert} />
			</div>

			<div class="flex items-center space-x-2">
				<Label for="isMirror">Mirror</Label>
				<Switch id="isMirror" bind:checked={$isMirror} />
			</div>

			<div class="flex items-center space-x-2">
				<Label for="mirrorLeft">Mirror Left</Label>
				<Switch id="mirrorLeft" bind:checked={$mirrorLeft} />
			</div>

			<Label for="mirrorPos">Mirror Position: {$mirrorPos}</Label>
			<Slider id="mirrorPos" bind:value={$mirrorPos} min={0} max={11} step={1} />
		</div>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full flex-col gap-10">
			<p>Scale: {JSON.stringify(scala.names(), null, 2)}</p>
		</div>
	</Card.Footer>
</Card.Root>
