import { clearAuthTokens } from '$lib/cookies/auth';
import { PUBLIC_BASE_PATH } from '$env/static/public';

export const POST = async ({ cookies, url }) => {
	clearAuthTokens(cookies, url.protocol);

	return new Response(null, {
		status: 302,
		headers: {
			Location: `${PUBLIC_BASE_PATH}/login`
		}
	});
};
