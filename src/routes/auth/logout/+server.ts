import { redirect } from '@sveltejs/kit';

export const POST = async ({ cookies }) => {
	cookies.delete('access_token', { path: '/' });
	return redirect(301, '/login');
};
