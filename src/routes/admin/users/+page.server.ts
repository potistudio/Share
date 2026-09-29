import { fail } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { deleteUser, listUsers } from "$lib/server/user";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	// biome-ignore lint/style/noNonNullAssertion: hooks.server.ts guarantees an owner session on /admin
	return { users: await listUsers(getDB(event)), currentUserId: event.locals.user!.id };
};

export const actions: Actions = {
	delete: async (event) => {
		const form = await event.request.formData();
		// biome-ignore lint/style/noNonNullAssertion: hooks.server.ts guarantees an owner session on /admin
		const deleted = await deleteUser(getDB(event), String(form.get("id")), event.locals.user!.id);
		if (!deleted)
			return fail(400, { message: "このユーザーは削除できません（自分自身と最後のオーナーは削除できません）" });
	},
};
