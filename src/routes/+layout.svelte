<script lang="ts">
	import '../app.css';
	import { logger } from '$lib/services/logger';
	import { setLogger } from '$lib/hooks/useLogger';

	let { children } = $props();

	setLogger(logger);
</script>

{@render children()}
