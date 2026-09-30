import { fail } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { deleteGuest, listUsers } from "$lib/server/user";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	return { users: await listUsers(getDB(event)) };
};

export const actions: Actions = {
	delete: async (event) => {
		const form = await event.request.formData();
		const deleted = await deleteGuest(getDB(event), String(form.get("id")));
		if (!deleted) return fail(400, { message: "このユーザーは削除できません（オーナーは削除できません）" });
	},
};
