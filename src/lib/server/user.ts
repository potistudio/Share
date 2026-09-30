import type { WebAuthnCredential } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export type Role = "owner" | "guest";

export type User = {
	id: string;
	name: string;
	role: Role;
};

// Returns false when the single-owner index rejects a second owner (e.g. two owner invites redeemed at once)
export async function createUser(
	db: D1Database,
	user: User & { credential: WebAuthnCredential; inviteId: string },
): Promise<boolean> {
	const now = Date.now();
	const { credential } = user;
	const batch = db.batch([
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
	try {
		await batch;
		return true;
	} catch (e) {
		if (user.role === "owner" && String(e).includes("UNIQUE constraint failed: users.role")) return false;
		throw e;
	}
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

// The single owner is never deletable, so the site always keeps its administrator
export async function deleteGuest(db: D1Database, id: string): Promise<boolean> {
	const { meta } = await db.prepare("DELETE FROM users WHERE id = ? AND role = 'guest'").bind(id).run();
	return meta.changes === 1;
}
