import { error, type Handle, redirect } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { validateSession } from "$lib/server/session";

const PUBLIC_PATH = /^\/(login|invite)(\/|$)/;

// Everything is private by default; only the login and invite flows are reachable without a session
export const handle: Handle = async ({ event, resolve }) => {
	const user = await validateSession(getDB(event), event.cookies);
	event.locals.user = user;

	const { pathname } = event.url;
	const isPage = event.request.method === "GET";

	if (PUBLIC_PATH.test(pathname)) {
		if (user && isPage) redirect(303, "/");
		return resolve(event);
	}

	if (!user) {
		if (isPage) redirect(303, "/login");
		error(401, "ログインが必要です");
	}

	if (pathname.startsWith("/admin") && user.role !== "owner") error(404, "Not Found");

	return resolve(event);
};
