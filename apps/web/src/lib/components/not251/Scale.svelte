<script lang="ts">
	import * as not251 from '@not251/not251';
	import { Slider } from '$lib/components/ui/slider';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { scaleNotes } from './store';

	// Stores for state management
	let intervals = $state(new not251.intervalVector([2, 2, 1, 2, 2, 2, 1], 12, 0));
	let root = $state([0]);
	let grado = $state([0]);
	let modo = $state([0]);
	let isInvert = $state(false);
	let isMirror = $state(false);
	let mirrorLeft = $state(false);
	let mirrorPos = $state([0]);

	// Update the scaleNotes store whenever inputs change
	$effect(() => {
		$scaleNotes = not251.scale({
			intervals: intervals,
			root: root[0],
			grado: grado[0],
			modo: modo[0],
			isInvert: isInvert,
			isMirror: isMirror,
			mirrorLeft: mirrorLeft,
			mirrorPos: mirrorPos[0]
		});
	});
</script>

<Card.Root class="w-full max-w-prose">
	<Card.Header>
		<Card.Title>Scale</Card.Title>
		<Card.Description>Demo for Scale generation</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col gap-10">
			<Label for="modo">Modo: {modo[0] + 1}</Label>
			<Slider id="modo" bind:value={modo} min={0} max={7} step={1} />
			<Label for="grado">Grado: {grado[0] + 1}</Label>
			<Slider id="grado" bind:value={grado} max={7} step={1} />
			<Label for="root">Root: {root[0]}</Label>
			<Slider id="root" bind:value={root} max={11} step={1} />

			<div class="flex items-center space-x-2">
				<Label for="isInvert">Invert</Label>
				<Switch id="isInvert" bind:checked={isInvert} />
			</div>

			<div class="flex items-center space-x-2">
				<Label for="isMirror">Mirror</Label>
				<Switch id="isMirror" bind:checked={isMirror} />
			</div>

			<div class="flex items-center space-x-2">
				<Label for="mirrorLeft">Mirror Left</Label>
				<Switch id="mirrorLeft" bind:checked={mirrorLeft} />
			</div>

			<Label for="mirrorPos">Mirror Position: {mirrorPos}</Label>
			<Slider id="mirrorPos" bind:value={mirrorPos} min={0} max={11} step={1} />
		</div>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full flex-col gap-10">
			<p>Scale: {JSON.stringify($scaleNotes, null, 2)}</p>
		</div>
	</Card.Footer>
</Card.Root>
