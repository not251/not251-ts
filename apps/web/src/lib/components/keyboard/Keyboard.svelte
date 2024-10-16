<script lang="ts">
	let {
		octaves = 2,
		middleC = 60,
		keysPressed = []
	}: { octaves: number; middleC: number; keysPressed: number[] } = $props();

	import Key from './Key.svelte';

	let keys = $state(
		[...Array(octaves * 12 + 1).keys()].map((i) => i + (middleC - Math.floor(octaves / 2) * 12))
	);
</script>

<div class="keyboard">
	<div>
		{#each keys as note}
			<Key keyWidth={30} noteNum={note} on:noteon on:noteoff pressed={keysPressed.includes(note)} />
		{/each}
	</div>
</div>

<style>
	.keyboard {
		display: flex;
		justify-content: center;
	}

	.keyboard > div {
		display: flex;
		overflow: auto;
		padding: 8px;
		height: 192px;
	}
</style>
