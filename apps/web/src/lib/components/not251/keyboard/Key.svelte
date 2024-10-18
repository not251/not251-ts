<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	let {
		noteNum = 0,
		keyWidth = 30,
		pressed = false
	}: { noteNum: number; keyWidth: number; pressed: boolean } = $props();

	const dispatch = createEventDispatcher<{ noteon: number; noteoff: number }>();

	let bias = $state(0);
	const isNatural: boolean = ![1, 3, 6, 8, 10].includes(noteNum % 12);

	if (!isNatural) {
		const noteMod = noteNum % 12;

		if ([1, 6].includes(noteMod)) {
			bias = -keyWidth / 12;
		} else if ([3, 10].includes(noteMod)) {
			bias = keyWidth / 12;
		}
	}

	function keyPressed() {
		if (pressed) return;
		dispatch('noteon', noteNum);
		pressed = true;
	}

	function keyReleased() {
		if (!pressed) return;
		dispatch('noteoff', noteNum);
		pressed = false;
	}
</script>

<button
	aria-label={`note ${noteNum}`}
	class:accidental={!isNatural}
	class:natural={isNatural}
	class:pressed
	style="--width: {keyWidth -
		keyWidth * 0.47 * (isNatural ? 0 : 1)}px; transform: translate({bias}px);"
	draggable="false"
	onmousedown={(e) => {
		e.preventDefault();
		keyPressed();
	}}
	onmouseup={(e) => {
		e.preventDefault();
		keyReleased();
	}}
	onmouseenter={(e) => {
		if (e.buttons) keyPressed();
	}}
	onmouseleave={(e) => {
		if (e.buttons) keyReleased();
	}}
	ontouchstart={(e) => {
		e.preventDefault();
		keyPressed();
	}}
	ontouchend={(e) => {
		e.preventDefault();
		keyReleased();
	}}
>
</button>

<style>
	button {
		flex-shrink: 0;
		width: var(--width);
		min-width: min-content;

		border-radius: 0px 0px calc(var(--width) / 8) calc(var(--width) / 8);
		-webkit-user-drag: none;
	}

	.accidental {
		margin: 0px calc(var(--width) / -2) 0px calc(var(--width) / -2);
		z-index: 2;

		height: 60%;
		background: black;

		box-shadow: inset white 0px 0px 2px 0px;
	}

	.natural {
		height: 100%;
		background: white;

		box-shadow: inset black 0px 0px 2px 0px;
	}

	.accidental.pressed {
		background: hsl(0, 0%, 40%);
	}

	.natural.pressed {
		background: hsl(0, 0%, 80%);
	}
</style>
