import { logger } from '$lib/services/logger.js';
import type { Actions } from '@sveltejs/kit';

const getStateData = async (response: Response) => {
	let error: Error;
	switch (response.status) {
		case 200:
			const state = response
				? await response.json().catch((error: Error) => {
						logger.error("While retrieving player's state body : ", { error });
						return null;
					})
				: null;
			return state;
		case 204:
			logger.error('Playback not available or active');
			return null;
		case 401:
			error = await response.json();
			logger.error('Bad or expired token : ', { error });
			return null;
		case 403:
			error = await response.json();
			logger.error('Bad Oauth request : ', { error });
			return null;
		case 429:
			error = await response.json();
			logger.error('Too many requests : ', { error });
			return null;
		default:
			logger.error('Unknown error');
			return null;
	}
};

const getState = async ({ fetch, token }: { fetch: any; token: string }) => {
	const response = await fetch('https://api.spotify.com/v1/me/player', {
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: Error) => {
		logger.error("While getting player's state : ", { error });
		return null;
	});

	return getStateData(response);
};

const getPlaylist = async ({ fetch, token, id }: { fetch: any; token: string; id: string }) => {
	const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).catch((error: Error) => {
		logger.error('While getting playlist : ', { error });
		return null;
	});
	const playlist = response
		? await response
				.json()
				.catch((error: Error) => logger.error('While retrieving playlist body : ', { error }))
		: null;
	return playlist;
};

const getPlayData = async (response: Response) => {
	let error: Error;
	switch (response.status) {
		case 204:
			return {};
		case 401:
			error = await response.json();
			logger.error('Bad or expired token : ', { error });
			return null;
		case 403:
			error = await response.json();
			logger.error('Bad Oauth request : ', { error });
			return null;
		case 429:
			error = await response.json();
			logger.error('Too many requests : ', { error });
			return null;
		default:
			logger.error('Unknown error : ', { response });
			return null;
	}
};

const playPlaylist = async ({
	fetch,
	token,
	uri,
	trackUri,
	time,
	deviceId
}: {
	fetch: any;
	token: string;
	uri: string;
	trackUri: string;
	time: number;
	deviceId: string;
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

	const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		},
		body: JSON.stringify({
			context_uri: uri,
			offset: trackUri ? { uri: trackUri } : undefined,
			position_ms: time
		})
	}).catch((error: Error) => {
		logger.error('While playing playlist : ', { error });
	});

	return getPlayData(response);
};

export const load = async ({ fetch, locals }) => {
	const state = await getState({ fetch, token: locals.token });

	const playlistDatas = [
		{
			keepPosition: true,
			id: '79AHgSwbYY0ExsYSQXjkLb'
		},
		{
			keepPosition: true,
			id: '5yijD2k37RNfgJ3c6kKafJ'
		},
		{
			keepPosition: true,
			id: '3hRgR7rI0S9CFe7tIlUItS'
		},
		{
			keepPosition: false,
			id: '4w1hqN8LtQAmEa7RPUgZ0R'
		},
		{
			keepPosition: true,
			id: '6zy0N8zNbGXxatyzNnrjlw'
		},
		{
			keepPosition: true,
			id: '0ElaMkg6JuiV7wHKjmBk1D'
		}
	];

	const playlists = await Promise.all(
		playlistDatas.map(async ({ id, keepPosition }: { id: string; keepPosition: boolean }) => {
			const playlist = await getPlaylist({ fetch, token: locals.token, id });
			return {
				...playlist,
				keepPosition
			};
		})
	);

	return { state, playlists, token: locals.token };
};

export const actions: Actions = {
	playPlaylist: async ({ fetch, locals, request }) => {
		const data = await request.formData();
		const uri = data.get('uri') as string;
		const trackUri = data.get('trackUri') as string;
		const time = Number(data.get('time'));
		const deviceId = data.get('deviceId') as string;

		return playPlaylist({ fetch, token: locals.token, uri, trackUri, time, deviceId });
	},
	device: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		await fetch('https://api.spotify.com/v1/me/player', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer ' + locals.token
			},
			body: JSON.stringify({
				device_ids: [id],
				play: true
			})
		}).catch((error: Error) => {
			logger.error('While setting device : ', { error });
		});
	}
};
