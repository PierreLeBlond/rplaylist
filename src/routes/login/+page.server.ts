import { SPOTIFY_CLIENT_ID } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export const actions = {
	login: async () => {
		var scope =
			'streaming \
               user-read-email \
               user-read-private \
               user-read-playback-state \
               user-modify-playback-state';

		var state = crypto.randomUUID();

		var auth_query_parameters = new URLSearchParams({
			response_type: 'code',
			client_id: SPOTIFY_CLIENT_ID,
			scope: scope,
			redirect_uri: `${PUBLIC_BASE_URL}/auth/callback`,
			state: state
		});

		return redirect(
			301,
			'https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString()
		);
	}
};
