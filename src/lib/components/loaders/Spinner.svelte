<script lang="ts">
	type Props = {
		size?: number;
	};

	let { size = 4 }: Props = $props();
</script>

<div
	class="animate-spin rounded-full border-r-4 border-t-4 border-secondary border-r-transparent"
	style:width={`${size}rem`}
	style:height={`${size}rem`}
></div>
