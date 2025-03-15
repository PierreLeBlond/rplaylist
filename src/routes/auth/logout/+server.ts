import { clearAuthTokens } from '$lib/cookies/auth';

export const POST = async ({ cookies, url }) => {
	clearAuthTokens(cookies, url.protocol);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/login'
		}
	});
};
