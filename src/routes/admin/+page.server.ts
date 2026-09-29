import { fail } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { createInvite, listInvites, revokeInvite } from "$lib/server/invite";
import { DAY } from "$lib/server/token";
import { deleteGuest, listUsers } from "$lib/server/user";
import type { Actions, PageServerLoad } from "./$types";

const INVITE_TTL_DAYS = [1, 7, 30];

export const load: PageServerLoad = async (event) => {
	const db = getDB(event);
	const [invites, users] = await Promise.all([listInvites(db), listUsers(db)]);
	return { invites, users, inviteTtlDays: INVITE_TTL_DAYS, now: Date.now() };
};

export const actions: Actions = {
	createInvite: async (event) => {
		const form = await event.request.formData();
		const note = String(form.get("note") ?? "").trim();
		const days = Number(form.get("days"));
		if (!INVITE_TTL_DAYS.includes(days)) return fail(400, { message: "有効期限が不正です" });

		const token = await createInvite(getDB(event), {
			role: "guest",
			note,
			// biome-ignore lint/style/noNonNullAssertion: hooks.server.ts guarantees an owner session on /admin
			createdBy: event.locals.user!.id,
			ttl: days * DAY,
		});
		return { inviteUrl: `${event.url.origin}/invite/${token}` };
	},

	revokeInvite: async (event) => {
		const form = await event.request.formData();
		await revokeInvite(getDB(event), String(form.get("id")));
	},

	deleteUser: async (event) => {
		const form = await event.request.formData();
		await deleteGuest(getDB(event), String(form.get("id")));
	},
};
