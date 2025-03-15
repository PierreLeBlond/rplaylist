import { SPOTIFY_CLIENT_ID } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { logger } from '$lib/services/logger.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const accessToken = cookies.get('access_token');
	const refreshToken = cookies.get('refresh_token');

	if (accessToken || refreshToken) {
		logger.info('User already logged in, redirecting to home');
		throw redirect(301, '/');
	}
};

export const actions = {
	login: async () => {
		const scope =
			'streaming \
               user-read-email \
               user-read-private \
               user-read-playback-state \
               user-modify-playback-state';

		const state = crypto.randomUUID();

		const auth_query_parameters = new URLSearchParams({
			response_type: 'code',
			client_id: SPOTIFY_CLIENT_ID,
			scope: scope,
			redirect_uri: `${PUBLIC_BASE_URL}/auth/callback`,
			state: state
		});

		logger.info('Redirecting to Spotify login');

		return redirect(
			301,
			'https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString()
		);
	}
};
