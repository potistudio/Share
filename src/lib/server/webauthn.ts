import type { WebAuthnCredential } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { Cookies } from "@sveltejs/kit";

export const RP_NAME = "ぽちファイル便";

const CHALLENGE_COOKIE = "webauthn_challenge";
const CHALLENGE_TTL = 5 * 60 * 1000;

export type ChallengeData = { type: "login" } | { type: "register"; inviteId: string; userId: string; name: string };

export async function saveChallenge(
	db: D1Database,
	cookies: Cookies,
	challenge: string,
	data: ChallengeData,
): Promise<void> {
	const now = Date.now();
	await db.batch([
		db.prepare("DELETE FROM auth_challenges WHERE expires_at <= ?").bind(now),
		db
			.prepare("INSERT INTO auth_challenges (challenge, data, expires_at) VALUES (?, ?, ?)")
			.bind(challenge, JSON.stringify(data), now + CHALLENGE_TTL),
	]);
	cookies.set(CHALLENGE_COOKIE, challenge, {
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		maxAge: CHALLENGE_TTL / 1000,
	});
}

// Challenges are single-use: deleting on read prevents replaying a captured response
export async function consumeChallenge<T extends ChallengeData["type"]>(
	db: D1Database,
	cookies: Cookies,
	type: T,
): Promise<{ challenge: string; data: Extract<ChallengeData, { type: T }> } | null> {
	const challenge = cookies.get(CHALLENGE_COOKIE);
	if (!challenge) return null;
	cookies.delete(CHALLENGE_COOKIE, { path: "/" });

	const row = await db
		.prepare("DELETE FROM auth_challenges WHERE challenge = ? AND expires_at > ? RETURNING data")
		.bind(challenge, Date.now())
		.first<{ data: string }>();
	if (!row) return null;

	const data: ChallengeData = JSON.parse(row.data);
	if (data.type !== type) return null;
	return { challenge, data: data as Extract<ChallengeData, { type: T }> };
}

export async function findCredential(
	db: D1Database,
	id: string,
): Promise<(WebAuthnCredential & { userId: string }) | null> {
	const row = await db
		.prepare("SELECT id, user_id, public_key, counter, transports FROM credentials WHERE id = ?")
		.bind(id)
		.first<{ id: string; user_id: string; public_key: string; counter: number; transports: string | null }>();
	if (!row) return null;
	return {
		id: row.id,
		userId: row.user_id,
		publicKey: isoBase64URL.toBuffer(row.public_key),
		counter: row.counter,
		transports: row.transports ? JSON.parse(row.transports) : undefined,
	};
}

export async function updateCredentialCounter(db: D1Database, id: string, counter: number): Promise<void> {
	await db
		.prepare("UPDATE credentials SET counter = ?, last_used_at = ? WHERE id = ?")
		.bind(counter, Date.now(), id)
		.run();
}
