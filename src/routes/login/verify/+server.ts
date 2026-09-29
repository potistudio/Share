import { type AuthenticationResponseJSON, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { error, json } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { createSession } from "$lib/server/session";
import { consumeChallenge, findCredential, updateCredentialCounter } from "$lib/server/webauthn";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
	const db = getDB(event);
	const response: AuthenticationResponseJSON = await event.request.json();

	const challenge = await consumeChallenge(db, event.cookies, "login");
	if (!challenge) error(400, "認証の有効期限が切れました。もう一度お試しください");

	const credential = await findCredential(db, response.id);
	if (!credential) error(400, "このパスキーは登録されていません");

	const verification = await verifyAuthenticationResponse({
		response,
		expectedChallenge: challenge.challenge,
		expectedOrigin: event.url.origin,
		expectedRPID: event.url.hostname,
		credential,
	}).catch(() => null);
	if (!verification?.verified) error(400, "パスキーを確認できませんでした");

	await updateCredentialCounter(db, credential.id, verification.authenticationInfo.newCounter);
	await createSession(db, event.cookies, credential.userId);
	return json({ ok: true });
};
