import type { RequestEvent } from "@sveltejs/kit";

export function getDB(event: Pick<RequestEvent, "platform">): D1Database {
	const db = event.platform?.env.DB;
	if (!db) throw new Error("D1 binding `DB` is not available");
	return db;
}
