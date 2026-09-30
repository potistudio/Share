import { getDB } from "$lib/server/db";
import { listInvites } from "$lib/server/invite";
import { listUsers } from "$lib/server/user";
import type { PageServerLoad } from "./$types";

const RECENT_LIMIT = 5;

export const load: PageServerLoad = async (event) => {
	const db = getDB(event);
	const [users, invites] = await Promise.all([listUsers(db), listInvites(db)]);

	const now = Date.now();
	const activeInvites = invites.filter((invite) => invite.usedAt === null && invite.expiresAt > now);

	return {
		recentUsers: users.slice(0, RECENT_LIMIT),
		activeInvites: activeInvites.slice(0, RECENT_LIMIT),
	};
};
