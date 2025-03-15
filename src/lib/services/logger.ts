import { browser } from '$app/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	context?: Record<string, unknown>;
	source: 'client' | 'server';
}

// ANSI color codes for console output (server-side only)
const colors = {
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	client: {
		debug: '\x1b[36m', // cyan
		info: '\x1b[34m', // blue
		warn: '\x1b[33m', // yellow
		error: '\x1b[31m' // red
	},
	server: {
		debug: '\x1b[96m', // bright cyan
		info: '\x1b[94m', // bright blue
		warn: '\x1b[93m', // bright yellow
		error: '\x1b[91m' // bright red
	}
};

export class Logger {
	private source: 'client' | 'server';

	constructor() {
		this.source = browser ? 'client' : 'server';
	}

	private async sendToServer(entry: LogEntry) {
		// Skip HTTP request if we're on the server
		if (!browser) return;

		try {
			await fetch('/api/logs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(entry)
			});
		} catch (error) {
			console.error('Failed to send log to server:', error);
		}
	}

	private createLogEntry(
		level: LogLevel,
		message: string,
		context?: Record<string, unknown>
	): LogEntry {
		return {
			level,
			message,
			timestamp: new Date().toISOString(),
			context,
			source: this.source
		};
	}

	private formatBrowserMessage(entry: LogEntry): [string, ...unknown[]] {
		const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
		const prefix = `[${entry.source}][${timestamp}]`;

		const args: unknown[] = [prefix, entry.message];
		if (entry.context && Object.keys(entry.context).length > 0) {
			args.push(entry.context);
		}

		return args as [string, ...unknown[]];
	}

	private formatServerMessage(entry: LogEntry): [string, ...unknown[]] {
		const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
		const colorSet = entry.source === 'client' ? colors.client : colors.server;
		const prefix = `${colorSet[entry.level]}[${entry.source}][${timestamp}]${colors.reset}`;

		const args: unknown[] = [prefix, entry.message];
		if (entry.context && Object.keys(entry.context).length > 0) {
			args.push(colors.dim, entry.context, colors.reset);
		}

		return args as [string, ...unknown[]];
	}

	private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
		const entry = this.createLogEntry(level, message, context);
		const consoleArgs = browser
			? this.formatBrowserMessage(entry)
			: this.formatServerMessage(entry);

		switch (level) {
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

		this.sendToServer(entry);
	}

	debug(message: string, context?: Record<string, unknown>) {
		this.log('debug', message, context);
	}

	info(message: string, context?: Record<string, unknown>) {
		this.log('info', message, context);
	}

	warn(message: string, context?: Record<string, unknown>) {
		this.log('warn', message, context);
	}

	error(message: string, context?: Record<string, unknown>) {
		this.log('error', message, context);
	}
}

export const logger = new Logger();
