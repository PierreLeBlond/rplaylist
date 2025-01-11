<script lang="ts">
	import { enhance } from '$app/forms';

	type Props = {
		playerId: string;
		deviceId: string | null;
	};

	let { playerId, deviceId }: Props = $props();
</script>

{#if playerId === deviceId}
	<p>Listening on this device</p>
{:else}
	<form action="?/device" method="POST" use:enhance>
		<input hidden name="id" value={playerId} />
		<button class="rounded-lg bg-secondary px-4 py-2 text-primary shadow shadow-yellow-950"
			>Listen on this device</button
		>
	</form>
{/if}
