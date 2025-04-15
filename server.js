// We wrap sveltekit generated index.js to avoid some passenger error with top level await
async function startServer() {
	try {
		await import('./build/index.js');
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

startServer();
