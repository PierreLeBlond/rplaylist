import type { Cookies } from '@sveltejs/kit';
import { logger } from '$lib/services/logger';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getCookieOptions = (protocol: string) => ({
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: protocol === 'https:'
});

export const setAuthTokens = (
	cookies: Cookies,
	protocol: string,
	{
		accessToken,
		refreshToken,
		expiresIn
	}: { accessToken: string; refreshToken: string; expiresIn: number }
) => {
	const options = getCookieOptions(protocol);

	logger.info('Setting auth cookies');
	cookies.set(ACCESS_TOKEN_KEY, accessToken, {
		...options,
		expires: new Date(new Date().getTime() + expiresIn * 1000)
	});
	cookies.set(REFRESH_TOKEN_KEY, refreshToken, options);
};

export const getAuthTokens = (cookies: Cookies) => {
	const accessToken = cookies.get(ACCESS_TOKEN_KEY);
	const refreshToken = cookies.get(REFRESH_TOKEN_KEY);

	return { accessToken, refreshToken };
};

export const clearAuthTokens = (cookies: Cookies, protocol: string) => {
	const options = getCookieOptions(protocol);

	logger.info('Deleting auth cookies');
	cookies.delete(ACCESS_TOKEN_KEY, options);
	cookies.delete(REFRESH_TOKEN_KEY, options);
};
