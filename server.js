// Use dynamic import to load the ESM app
// We wrap sveltekit generated handler in an express app to avoid some passenger error with top level await
async function startServer() {
    try {
        const { handler } = await import('./handler.js');
        const port = process.env.PORT || 3000;
        
        const app = (await import('express')).default();
        
        // Add any necessary middleware here
        app.use(handler);
        
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();