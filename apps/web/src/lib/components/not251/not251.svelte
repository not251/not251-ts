<script lang="ts">
	import Play from './Play.svelte';
	import Scale from './Scale.svelte';
	import Chord from './Chord.svelte';
	import Keyboard from './keyboard/Keyboard.svelte';

	import { chord } from './store';
</script>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<Keyboard
		middleC={64}
		octaves={$chord.options.octave[0]}
		keysPressed={$chord.notes?.data ?? []}
	/>
	<Play />
</div>
<div class="flex w-full flex-row items-start justify-center gap-10">
	<Scale />
	<Chord />
</div>
