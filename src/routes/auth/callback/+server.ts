import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ fetch, url, cookies }) => {
	const code = url.searchParams.get('code') as string;

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: 'http://localhost:5173/auth/callback'
		})
	});
	const body = await response.json();

	if (body.error) {
		throw redirect(301, '/login');
	}

	cookies.set('access_token', body.access_token, {
		path: '/',
		httpOnly: true,
		expires: new Date(new Date().getTime() + body.expires_in * 10)
	});
	cookies.set('refresh_token', body.refresh_token, {
		path: '/',
		httpOnly: true
	});

	return redirect(301, '/');
};
