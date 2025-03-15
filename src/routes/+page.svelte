<script lang="ts">
	import { DoorOpen } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { cn } from '$lib/utils';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import Player from '$lib/components/player/Player.svelte';
	import Spinner from '$lib/components/loaders/Spinner.svelte';
	import { fadeIn } from '$lib/fade/fadeIn';
	import { fadeOut } from '$lib/fade/fadeOut';
	import type { ActionResult } from '@sveltejs/kit';
	import { useLogger } from '$lib/hooks/useLogger';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const logger = useLogger();

	let player: Spotify.Player | null = $state(null);
	let playerId: string | null = $state(null);

	let optimisticCurrentPlaylistId: string | null = $state(null);
	let currentPlaylistId = $derived.by(() => {
		if (optimisticCurrentPlaylistId !== null) {
			return optimisticCurrentPlaylistId;
		}

		if (data.state?.context?.type !== 'playlist') {
			return null;
		}

		return data.state.context.uri.split(':')[2];
	});

	const playlistContexts: { [uri: string]: { trackUri: string; time: number } } = $state({});

	$effect(() => {
		const lastContext = data.state?.context?.type == 'playlist' ? data.state.context : null;

		if (lastContext) {
			const uri = data.state.context.uri;
			localStorage.setItem(
				`playlist_${uri}`,
				JSON.stringify({
					trackUri: data.state.item.uri,
					time: data.state.progress_ms
				})
			);
		}

		data.playlists.forEach((playlist) => {
			const uri = playlist.uri;
			const stored = localStorage.getItem(`playlist_${uri}`);
			if (stored) {
				const { trackUri, time } = JSON.parse(stored);
				playlistContexts[uri] = {
					trackUri,
					time
				};
			}
		});
	});

	onMount(() => {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
			player = new window.Spotify.Player({
				name: 'rplaylist',
				getOAuthToken: (cb) => {
					cb(data.token);
				},
				volume: 1
			});

			player.addListener('autoplay_failed', () => {
				logger.error('Autoplay failed');
			});

			player.on('playback_error', ({ message }) => {
				logger.error('Failed to perform playback', { message });
			});

			player.addListener('ready', ({ device_id }) => {
				playerId = device_id;
			});

			player.addListener('not_ready', () => {
				playerId = null;
			});

			player.connect();
		};

		return () => {
			if (!player) {
				return;
			}
			player.disconnect();
		};
	});

	const handleSubmit = async (event: SubmitEvent, playlistId: string) => {
		event.preventDefault();
		if (!player) {
			return;
		}

		const target = event.target as HTMLFormElement;

		optimisticCurrentPlaylistId = playlistId;
		const data = new FormData(target);

		await fadeOut(player);
		const response = await fetch(target.action, {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
		}

		await fadeIn(player);

		applyAction(result);
	};
</script>

<section class="bg-background flex h-full w-full items-center justify-center">
	<div class="grid w-64 grid-cols-3 gap-4">
		<form action="/auth/logout" method="POST" class="col-span-3 flex justify-center">
			<button
				type="submit"
				class="bg-destructive text-destructive-foreground rounded-full p-4 shadow shadow-red-950"
			>
				<DoorOpen></DoorOpen>
			</button>
		</form>
		<div class="col-span-3 grid grid-cols-2 gap-4 p-4">
			{#each data.playlists as playlist (playlist.uri)}
				{@const image = playlist.images?.[0].url}
				<form
					method="POST"
					action="?/playPlaylist"
					class="flex justify-center"
					onsubmit={(event: SubmitEvent) => handleSubmit(event, playlist.id)}
				>
					<input hidden name="uri" value={playlist.uri} />
					<input
						hidden
						name="trackUri"
						value={playlist.keepPosition ? playlistContexts[playlist.uri]?.trackUri : undefined}
					/>
					<input
						hidden
						name="time"
						value={playlist.keepPosition ? playlistContexts[playlist.uri]?.time : undefined}
					/>
					<input hidden name="deviceId" value={playerId} />
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
		<div
			class="text-foreground col-span-3 flex h-48 flex-col items-center justify-center gap-8 p-2 font-bold"
		>
			{#if player}
				<Player {player} {playerId} deviceId={data.state?.device.id} />
			{:else}
				<Spinner size={8}></Spinner>
			{/if}
		</div>
	</div>
</section>
