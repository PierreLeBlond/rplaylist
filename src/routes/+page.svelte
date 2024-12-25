<script lang="ts">
	import { DoorOpen, Pause, Play, SkipBack, SkipForward } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let optimisticCurrentPlaylistId = $state(null);
	let currentPlaylistId = $derived.by(() => {
		if (optimisticCurrentPlaylistId !== null) {
			return optimisticCurrentPlaylistId;
		}

		if (data.state?.context?.type !== 'playlist') {
			return null;
		}

		return data.state.context.uri.split(':')[2];
	});

	let optimisticIsPlaying: boolean | null = $state(null);
	let isPlaying = $derived.by(() => {
		if (optimisticIsPlaying !== null) {
			return optimisticIsPlaying;
		}

		return data.state?.is_playing;
	});
</script>

<section class="flex h-full w-full items-center justify-center bg-yellow-900">
	<div class="grid w-64 grid-cols-3 gap-4">
		<form action="/auth/logout" method="POST" class="col-span-3 flex justify-center">
			<button
				type="submit"
				class="rounded-full bg-red-800 p-4 text-yellow-100 shadow shadow-red-950"
			>
				<DoorOpen></DoorOpen>
			</button>
		</form>
		<div class="col-span-3 grid grid-cols-2 gap-4 p-4">
			{#each data.playlists as playlist (playlist.uri)}
				{@const image = playlist.images?.[0].url}
				{@const position = Math.floor(Math.random() * playlist.tracks.total)}
				<form
					method="POST"
					action="?/playPlaylist"
					class="flex justify-center"
					use:enhance={() =>
						async ({ result }) => {
							optimisticCurrentPlaylistId = playlist.id;
							optimisticIsPlaying = true;
							invalidateAll();
							return applyAction(result);
						}}
				>
					<input hidden name="uri" value={playlist.uri} />
					<input hidden name="position" value={position} />
					<button
						type="submit"
						disabled={playlist.id === currentPlaylistId}
						class={cn(
							'relative flex h-24 w-24 items-center justify-center rounded-full bg-stone-500 transition-opacity',
							playlist.id === currentPlaylistId ? 'opacity-100' : 'opacity-50 hover:opacity-90'
						)}
					>
						{#if image}
							<div
								style:background-image={`url(${image})`}
								class="h-full w-full rounded-full bg-cover bg-center"
								style:box-shadow={`5px 5px 5px 2px rgba(255,255,255,0.75) inset, -5px -5px 5px 2px rgba(0,0,0,0.75) inset, 3px 3px 3px 2px rgba(0,0,0,0.75)`}
							></div>
						{/if}
					</button>
				</form>
			{/each}
		</div>
		<div class="col-span-3 p-2 text-center font-bold text-yellow-100">
			{#if data.state?.device}
				<p>listening on {data.state.device.name}</p>
			{:else}
				<p>No device is connected, connect one and reload the page</p>
			{/if}
		</div>
		<div class="col-span-3 flex items-center justify-center gap-4">
			<form method="POST" action="?/previous" use:enhance>
				<button
					type="submit"
					class="rounded-full bg-yellow-800 p-4 text-yellow-100 shadow shadow-yellow-950"
				>
					<SkipBack></SkipBack>
				</button>
			</form>
			<form
				method="POST"
				action={isPlaying ? '?/pause' : '?/play'}
				use:enhance={() =>
					async ({ result }) => {
						optimisticIsPlaying = !isPlaying;
						return applyAction(result);
					}}
			>
				<button
					type="submit"
					class="rounded-full bg-yellow-800 p-4 text-yellow-100 shadow shadow-yellow-950"
				>
					{#if isPlaying}
						<Pause></Pause>
					{:else}
						<Play></Play>
					{/if}
				</button>
			</form>
			<form method="POST" action="?/next" use:enhance>
				<button
					type="submit"
					class="rounded-full bg-yellow-800 p-4 text-yellow-100 shadow shadow-yellow-950"
				>
					<SkipForward></SkipForward>
				</button>
			</form>
		</div>
	</div>
</section>
