import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/services/logger';
import { getAuthTokens, getCookieOptions, setAuthTokens } from '$lib/cookies/auth';
import { PUBLIC_BASE_PATH } from '$env/static/public';

export const handle = async ({ event, resolve }) => {
	if (event.url.pathname === `/${PUBLIC_BASE_PATH}/login` || event.url.pathname === `/${PUBLIC_BASE_PATH}/auth/callback`) {
		return resolve(event);
	}

	const authTokens = getAuthTokens(event.cookies);

	if (!authTokens.accessToken && !authTokens.refreshToken) {
		logger.info('No access token or refresh token found');
		return redirect(301, `/${PUBLIC_BASE_PATH}/login`);
	}

	if (!authTokens.accessToken) {
		logger.info('No access token found, refreshing');
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: authTokens.refreshToken as string
			})
		});

		const body = await response.json();

		if (body.error) {
			throw redirect(301, `/${PUBLIC_BASE_PATH}/login`);
		}

		setAuthTokens(event.cookies, event.url.protocol, {
			accessToken: body.access_token,
			refreshToken: body.refresh_token || authTokens.refreshToken,
			expiresIn: body.expires_in
		});

		if (body.refresh_token) {
			event.cookies.set('refresh_token', body.refresh_token, getCookieOptions(event.url.protocol));
		}

		event.locals.token = body.access_token;
	} else {
		event.locals.token = authTokens.accessToken;
	}

	logger.info('Access token set');

	const response = await resolve(event);

	return response;
};
