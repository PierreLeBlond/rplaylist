import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/login' || event.url.pathname === '/auth/callback') {
		return resolve(event);
	}

	let accessToken = event.cookies.get('access_token') as string;
	const refreshToken = event.cookies.get('refresh_token') as string;

	if (!accessToken && !refreshToken) {
		throw redirect(301, '/login');
	}

	if (!accessToken) {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken
			})
		});

		const body = await response.json();

		if (body.error) {
			console.error(body.error);
			throw redirect(301, '/login');
		}

		event.cookies.set('access_token', body.access_token, {
			path: '/',
			httpOnly: true,
			expires: new Date(new Date().getTime() + body.expires_in * 10)
		});

		if (body.refresh_token) {
			event.cookies.set('refresh_token', body.refresh_token, {
				path: '/',
				httpOnly: true
			});
		}

		accessToken = body.access_token;
	}

	event.locals.token = accessToken;

	const response = await resolve(event);

	return response;
};
