import { error, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { getDB } from "$lib/server/db";
import { createSession } from "$lib/server/session";
import type { Role } from "$lib/server/user";
import type { RequestHandler } from "./$types";

const DEV_USERS: Record<Role, { id: string; name: string }> = {
	owner: { id: "dev-owner", name: "Dev Owner" },
	guest: { id: "dev-guest", name: "Dev Guest" },
};

// Skips passkeys during `vite dev`; `dev` is a build-time constant, so this is always a 404 in production builds
export const POST: RequestHandler = async (event) => {
	if (!dev) error(404, "Not Found");

	const form = await event.request.formData();
	const role = form.get("role");
	if (role !== "owner" && role !== "guest") error(400, "権限が不正です");

	const db = getDB(event);
	const user = DEV_USERS[role];
	await db
		.prepare("INSERT OR IGNORE INTO users (id, name, role, created_at) VALUES (?, ?, ?, ?)")
		.bind(user.id, user.name, role, Date.now())
		.run();
	await createSession(db, event.cookies, user.id);
	redirect(303, "/");
};
