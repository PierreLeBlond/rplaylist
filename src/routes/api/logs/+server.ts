import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LogEntry } from '$lib/services/logger';

// ANSI color codes for console output
const colors = {
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	client: {
		debug: '\x1b[36m', // cyan
		info: '\x1b[34m', // blue
		warn: '\x1b[33m', // yellow
		error: '\x1b[31m' // red
	}
};

function formatServerMessage(entry: LogEntry): [string, ...unknown[]] {
	const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
	const prefix = `${colors.client[entry.level]}[${entry.source}][${timestamp}]${colors.reset}`;

	const args: unknown[] = [prefix, entry.message];
	if (entry.context && Object.keys(entry.context).length > 0) {
		args.push(colors.dim, entry.context, colors.reset);
	}

	return args as [string, ...unknown[]];
}

export const POST: RequestHandler = async ({ request }) => {
	const logEntry: LogEntry = await request.json();
	const consoleArgs = formatServerMessage(logEntry);

	switch (logEntry.level) {
		case 'debug':
			console.debug(...consoleArgs);
			break;
		case 'info':
			console.info(...consoleArgs);
			break;
		case 'warn':
			console.warn(...consoleArgs);
			break;
		case 'error':
			console.error(...consoleArgs);
			break;
	}

	return json({ success: true });
};
