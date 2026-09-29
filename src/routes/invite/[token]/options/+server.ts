import { generateRegistrationOptions } from "@simplewebauthn/server";
import { error, json } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { findUsableInvite } from "$lib/server/invite";
import { RP_NAME, saveChallenge } from "$lib/server/webauthn";
import type { RequestHandler } from "./$types";

const MAX_NAME_LENGTH = 32;

export const POST: RequestHandler = async (event) => {
	const db = getDB(event);
	const invite = await findUsableInvite(db, event.params.token);
	if (!invite) error(404, "この招待リンクは無効か、有効期限が切れています");

	const { name } = await event.request.json<{ name?: unknown }>();
	const trimmed = typeof name === "string" ? name.trim() : "";
	if (!trimmed || trimmed.length > MAX_NAME_LENGTH) error(400, `名前は1〜${MAX_NAME_LENGTH}文字で入力してください`);

	const userId = crypto.randomUUID();
	const options = await generateRegistrationOptions({
		rpName: RP_NAME,
		rpID: event.url.hostname,
		userName: trimmed,
		userID: new TextEncoder().encode(userId),
		attestationType: "none",
		authenticatorSelection: {
			residentKey: "required",
			userVerification: "required",
		},
	});
	await saveChallenge(db, event.cookies, options.challenge, {
		type: "register",
		inviteId: invite.id,
		userId,
		name: trimmed,
	});
	return json(options);
};
