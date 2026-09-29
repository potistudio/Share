import { getDB } from "$lib/server/db";
import { listInvites } from "$lib/server/invite";
import { countActiveSessions } from "$lib/server/session";
import { DAY } from "$lib/server/token";
import { listUsers } from "$lib/server/user";
import type { PageServerLoad } from "./$types";

const RECENT_LIMIT = 5;

export const load: PageServerLoad = async (event) => {
	const db = getDB(event);
	const [users, invites, activeSessions] = await Promise.all([
		listUsers(db),
		listInvites(db),
		countActiveSessions(db),
	]);

	const now = Date.now();
	const activeInvites = invites.filter((invite) => invite.usedAt === null && invite.expiresAt > now);

	return {
		now,
		stats: {
			owners: users.filter((user) => user.role === "owner").length,
			guests: users.filter((user) => user.role === "guest").length,
			activeInvites: activeInvites.length,
			activeSessions,
			newUsers: users.filter((user) => user.createdAt > now - 7 * DAY).length,
		},
		recentUsers: users.slice(0, RECENT_LIMIT),
		activeInvites: activeInvites.slice(0, RECENT_LIMIT),
	};
};
