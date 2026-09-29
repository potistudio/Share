import { redirect } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { invalidateSession } from "$lib/server/session";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
	await invalidateSession(getDB(event), event.cookies);
	redirect(303, "/login");
};
