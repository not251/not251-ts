<script lang="ts">
	import Chord from '$lib/components/not251/Chord.svelte';
	import Scale from '$lib/components/not251/Scale.svelte';
</script>

<div class="flex w-full flex-col items-center justify-center gap-10 py-10">
	<h1 class="text-center text-4xl font-semibold">not251 Web Demo</h1>
	<div class="flex w-full flex-row items-center justify-center gap-10">
		<Scale />

		<Chord />
	</div>
</div>
