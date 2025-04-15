import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_BASE_URL, PUBLIC_BASE_PATH } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/services/logger';
import { setAuthTokens } from '$lib/cookies/auth';

export const GET = async ({ fetch, url, cookies }) => {
	const code = url.searchParams.get('code') as string;

	logger.info('Received Spotify callback');

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
			redirect_uri: `${PUBLIC_BASE_URL}/auth/callback`
		})
	});
	const body = await response.json();

	if (body.error) {
		logger.error(body.error);
		throw redirect(301, `${PUBLIC_BASE_PATH}/login`);
	}

	setAuthTokens(cookies, url.protocol, {
		accessToken: body.access_token,
		refreshToken: body.refresh_token,
		expiresIn: body.expires_in
	});

	throw redirect(301, `${PUBLIC_BASE_PATH}/`);
};
