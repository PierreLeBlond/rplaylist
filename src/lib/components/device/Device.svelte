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
		<button class="bg-secondary text-primary rounded-lg px-4 py-2 shadow shadow-yellow-950"
			>Listen on this device</button
		>
	</form>
{/if}
