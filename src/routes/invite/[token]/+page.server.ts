import { error } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { findUsableInvite } from "$lib/server/invite";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const invite = await findUsableInvite(getDB(event), event.params.token);
	if (!invite) error(404, "この招待リンクは無効か、有効期限が切れています");
	return { role: invite.role };
};
