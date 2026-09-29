import { type RegistrationResponseJSON, verifyRegistrationResponse } from "@simplewebauthn/server";
import { error, json } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { claimInvite, findUsableInvite } from "$lib/server/invite";
import { createSession } from "$lib/server/session";
import { createUser } from "$lib/server/user";
import { consumeChallenge } from "$lib/server/webauthn";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
	const db = getDB(event);
	const response: RegistrationResponseJSON = await event.request.json();

	const challenge = await consumeChallenge(db, event.cookies, "register");
	if (!challenge) error(400, "登録の有効期限が切れました。もう一度お試しください");

	const invite = await findUsableInvite(db, event.params.token);
	if (!invite || invite.id !== challenge.data.inviteId) error(404, "この招待リンクは無効か、有効期限が切れています");

	const verification = await verifyRegistrationResponse({
		response,
		expectedChallenge: challenge.challenge,
		expectedOrigin: event.url.origin,
		expectedRPID: event.url.hostname,
	}).catch(() => null);
	if (!verification?.verified) error(400, "パスキーを確認できませんでした");

	if (!(await claimInvite(db, invite.id))) error(409, "この招待リンクはすでに使用されています");

	const { userId, name } = challenge.data;
	await createUser(db, {
		id: userId,
		name,
		role: invite.role,
		credential: verification.registrationInfo.credential,
		inviteId: invite.id,
	});
	await createSession(db, event.cookies, userId);
	return json({ ok: true });
};
