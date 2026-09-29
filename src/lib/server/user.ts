import type { WebAuthnCredential } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export type Role = "owner" | "guest";

export type User = {
	id: string;
	name: string;
	role: Role;
};

export async function createUser(
	db: D1Database,
	user: User & { credential: WebAuthnCredential; inviteId: string },
): Promise<void> {
	const now = Date.now();
	const { credential } = user;
	await db.batch([
		db
			.prepare("INSERT INTO users (id, name, role, created_at) VALUES (?, ?, ?, ?)")
			.bind(user.id, user.name, user.role, now),
		db
			.prepare(
				"INSERT INTO credentials (id, user_id, public_key, counter, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.bind(
				credential.id,
				user.id,
				isoBase64URL.fromBuffer(credential.publicKey),
				credential.counter,
				JSON.stringify(credential.transports ?? []),
				now,
			),
		db.prepare("UPDATE invites SET used_by = ? WHERE id = ?").bind(user.id, user.inviteId),
	]);
}

export type UserSummary = User & { createdAt: number; lastLoginAt: number | null };

export async function listUsers(db: D1Database): Promise<UserSummary[]> {
	const { results } = await db
		.prepare(
			`SELECT u.id, u.name, u.role, u.created_at AS createdAt, MAX(c.last_used_at) AS lastLoginAt
			FROM users u LEFT JOIN credentials c ON c.user_id = u.id
			GROUP BY u.id
			ORDER BY u.created_at DESC`,
		)
		.all<UserSummary>();
	return results;
}

// Guards run inside the DELETE so the site can never end up without an owner, even under concurrent deletes
export async function deleteUser(db: D1Database, id: string, actorId: string): Promise<boolean> {
	const { meta } = await db
		.prepare(
			`DELETE FROM users
			WHERE id = ?1 AND id != ?2
				AND (role = 'guest' OR (SELECT COUNT(*) FROM users WHERE role = 'owner' AND id != ?1) > 0)`,
		)
		.bind(id, actorId)
		.run();
	return meta.changes === 1;
}
