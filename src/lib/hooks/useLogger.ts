import { getContext, setContext } from 'svelte';
import type { Logger } from '$lib/services/logger';

const LOGGER_CONTEXT_KEY = Symbol('logger');

export function setLogger(logger: Logger) {
	setContext(LOGGER_CONTEXT_KEY, logger);
}

export function useLogger(): Logger {
	const logger = getContext<Logger>(LOGGER_CONTEXT_KEY);
	if (!logger) {
		throw new Error('Logger context not found. Make sure to call setLogger in your root layout.');
	}
	return logger;
}
