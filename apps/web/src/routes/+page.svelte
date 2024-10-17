<script lang="ts">
	import Scale from '$lib/components/not251/Scale.svelte';
	import Chord from '$lib/components/not251/Chord.svelte';
	import Keyboard from '$lib/components/keyboard/Keyboard.svelte';

	import { chord } from '$lib/components/not251/store';
</script>

<div class="flex w-full flex-col items-center justify-center gap-10 py-10">
	<h1 class="text-center text-4xl font-semibold">not251 Web Demo</h1>
	<div class="w-full">
		<Keyboard middleC={64} octaves={$chord.options.octave[0]} keysPressed={$chord.notes.data} />
	</div>
	<div class="flex w-full flex-row items-start justify-center gap-10">
		<Scale />
		<Chord />
	</div>
</div>
