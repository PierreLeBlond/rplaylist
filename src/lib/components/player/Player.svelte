<script lang="ts">
	import { Pause, Play, SkipBack, SkipForward } from 'lucide-svelte';
	import { Slider } from '../ui/slider';
	import Device from '$lib/components/device/Device.svelte';
	import Spinner from '../loaders/Spinner.svelte';

	type Props = {
		player: Spotify.Player;
		playerId: string | null;
		deviceId: string | null;
	};

	const { player, playerId, deviceId }: Props = $props();

	let isPlaying = $state(false);

	player.addListener('player_state_changed', (state) => {
		if (!state) {
			return;
		}

		isPlaying = !state.paused;
	});
</script>

<div class="flex h-16 min-h-16 w-full items-center justify-center">
	{#if playerId}
		<Device {playerId} {deviceId}></Device>
	{:else}
		<Spinner></Spinner>
	{/if}
</div>

<div class="col-span-3 flex items-center justify-center gap-4">
	<button
		type="button"
		class="bg-secondary text-primary rounded-full p-4 shadow shadow-yellow-950"
		onclick={() => player.previousTrack()}
	>
		<SkipBack></SkipBack>
	</button>
	<button
		type="button"
		class="bg-secondary text-primary rounded-full p-4 shadow shadow-yellow-950"
		onclick={() => player.togglePlay()}
	>
		{#if isPlaying}
			<Pause></Pause>
		{:else}
			<Play></Play>
		{/if}
	</button>
	<button
		type="button"
		class="bg-secondary text-primary rounded-full p-4 shadow shadow-yellow-950"
		onclick={() => player.nextTrack()}
	>
		<SkipForward></SkipForward>
	</button>
</div>

<Slider
	type="single"
	min={0}
	max={1}
	step={0.01}
	value={1}
	onValueChange={(value: number) => player?.setVolume(value)}
></Slider>
