const DURATION = 1000;

export const fade = async (
	player: Spotify.Player,
	source: number,
	target: number
): Promise<void> => {
	const time = Date.now();

	return new Promise((resolve) => {
		const setVolume = async () => {
			const diff = Date.now() - time;
			const t = Math.min(1, Math.max(0, diff / DURATION));
			const volume = source + t * (target - source);

			await player.setVolume(volume);

			if (volume == target) {
				resolve();
				return;
			}

			setTimeout(setVolume, 100);
		};

		setVolume();
	});
};
