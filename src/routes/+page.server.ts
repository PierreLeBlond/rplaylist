const getStateData = async (response: any) => {
	let error: any;
	switch (response.status) {
		case 200:
			const state = response
				? await response.json().catch((error: any) => {
						console.error("While retrieving player's state body : ", error);
						return null;
					})
				: null;
			return state;
		case 204:
			console.error('Playback not available or active');
			return null;
		case 401:
			error = await response.json();
			console.error('Bad or expired token : ', error);
			return null;
		case 403:
			error = await response.json();
			console.error('Bad Oauth request : ', error);
			return null;
		case 429:
			error = await response.json();
			console.error('Too many requests : ', error);
			return null;
		default:
			console.error('Unknown error');
			return null;
	}
};

const getState = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player', {
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error("While getting player's state : ", error);
		return null;
	});

	return getStateData(response);
};

const getPlaylist = async ({ fetch, token, id }: { fetch: any; token: string; id: string }) => {
	const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error('While getting playlist : ', error);
		return null;
	});
	const playlist = response
		? await response
				.json()
				.catch((error: any) => console.error('While retrieving playlist body : ', error))
		: null;
	return playlist;
};

const getPlayData = async (response: any) => {
	let error: any;
	switch (response.status) {
		case 204:
			return {};
		case 401:
			error = await response.json();
			console.error('Bad or expired token : ', error);
			return null;
		case 403:
			error = await response.json();
			console.error('Bad Oauth request : ', error);
			return null;
		case 429:
			error = await response.json();
			console.error('Too many requests : ', error);
			return null;
		default:
			console.error('Unknown error : ', response);
			return null;
	}
};

const play = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player/play', {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error("While setting player's state on play : ", error);
	});

	return getPlayData(response);
};

const pause = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error("While setting player's state on pause : ", error);
	});

	return getPlayData(response);
};

const previous = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
		method: 'POST',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error("While setting player's state on previous : ", error);
	});

	return getPlayData(response);
};

const next = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player/next', {
		method: 'POST',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error("While setting player's state on next : ", error);
	});

	return getPlayData(response);
};

const playPlaylist = async ({
	fetch,
	token,
	uri,
	position
}: {
	fetch: any;
	token: string;
	uri: string;
	position: string;
}) => {
	await fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		}
	});

	await fetch('https://api.spotify.com/v1/me/player/repeat?state=context', {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		}
	});

	const response = await fetch('https://api.spotify.com/v1/me/player/play', {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		},
		body: JSON.stringify({
			context_uri: uri,
			offset: { position }
		})
	}).catch((error: any) => {
		console.error('While playing playlist : ', error);
	});

	return getPlayData(response);
};

const setVolume = async ({
	fetch,
	token,
	volume
}: {
	fetch: any;
	token: string;
	volume: string;
}) => {
	await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: any) => {
		console.error('While setting volume : ', error);
	});
};

export const load = async ({ fetch, locals }) => {
	const state = await getState({ fetch, token: locals.token });

	const playlistUids = [
		'79AHgSwbYY0ExsYSQXjkLb',
		'5yijD2k37RNfgJ3c6kKafJ',
		'3hRgR7rI0S9CFe7tIlUItS',
		'4w1hqN8LtQAmEa7RPUgZ0R',
		'6zy0N8zNbGXxatyzNnrjlw',
		'0ElaMkg6JuiV7wHKjmBk1D'
	];

	const playlists = await Promise.all(
		playlistUids.map((id: string) => getPlaylist({ fetch, token: locals.token, id }))
	);

	return { state, playlists };
};

export const actions = {
	play: async ({ fetch, locals }) => play({ fetch, token: locals.token }),
	pause: async ({ fetch, locals }) => pause({ fetch, token: locals.token }),
	previous: async ({ fetch, locals }) => previous({ fetch, token: locals.token }),
	next: async ({ fetch, locals }) => next({ fetch, token: locals.token }),
	playPlaylist: async ({ fetch, locals, request }) => {
		const data = await request.formData();
		const uri = data.get('uri') as string;
		const position = data.get('position') as string;
		return playPlaylist({ fetch, token: locals.token, uri, position });
	},
	setVolume: async ({ fetch, locals, request }) => {
		const data = await request.formData();
		const volume = data.get('volume') as string;
		const result = await setVolume({ fetch, token: locals.token, volume });
	}
};
