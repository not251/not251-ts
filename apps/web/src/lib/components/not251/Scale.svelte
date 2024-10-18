<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { scale as generateScale, positionVector } from '@not251/not251';
	import { scale } from '$lib/components/not251/store';
	import { initScaleOptions } from './utils';

	let options = $state(initScaleOptions);

	let scaleNotes: positionVector = $derived(
		generateScale({
			intervals: options.intervals,
			grado: options.grado[0],
			root: options.root[0],
			modo: options.modo[0],
			isInvert: options.isInvert,
			isMirror: options.isMirror,
			mirrorLeft: options.mirrorLeft,
			mirrorPos: options.mirrorPos[0]
		})
	);

	$effect(() => {
		$scale = {
			options: {
				intervals: options.intervals,
				grado: options.grado,
				root: options.root,
				modo: options.modo,
				isInvert: options.isInvert,
				isMirror: options.isMirror,
				mirrorLeft: options.mirrorLeft,
				mirrorPos: options.mirrorPos
			},
			notes: scaleNotes
		};
	});
</script>

<Card.Root class="w-full max-w-prose">
	<Card.Header>
		<Card.Title class="text-2xl">Scale</Card.Title>
		<Card.Description>Scale generation</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-col gap-5">
			<div class="space-y-2">
				<Label for="modo">Modo: {options.modo[0] + 1}</Label>
				<Slider id="modo" bind:value={options.modo} min={0} max={7} step={1} />
			</div>
			<div class="space-y-2">
				<Label for="grado">Grado: {options.grado[0] + 1}</Label>
				<Slider id="grado" bind:value={options.grado} max={7} step={1} />
			</div>
			<div class="space-y-2">
				<Label for="root">Root: {options.root[0]}</Label>
				<Slider id="root" bind:value={options.root} max={11} step={1} />
			</div>
			<div class="flex flex-col gap-2">
				<div class="flex items-center space-x-2">
					<Label for="isInvert">Invert</Label>
					<Switch id="isInvert" bind:checked={options.isInvert} />
				</div>
				<div class="flex items-center space-x-2">
					<Label for="isMirror">Mirror</Label>
					<Switch id="isMirror" bind:checked={options.isMirror} />
				</div>

				<div class="flex items-center space-x-2">
					<Label for="mirrorLeft">Mirror Left</Label>
					<Switch id="mirrorLeft" bind:checked={options.mirrorLeft} />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="mirrorPos">Mirror Position: {options.mirrorPos}</Label>
				<Slider id="mirrorPos" bind:value={options.mirrorPos} min={0} max={11} step={1} />
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex w-full items-center justify-center gap-2">
		<p>Scale Notes: {JSON.stringify($scale.notes?.data, null, 2)}</p>
	</Card.Footer>
</Card.Root>
